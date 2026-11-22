const crypto = require("crypto");
const express = require("express");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenAI, Type } = require("@google/genai");

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.GCP_PROJECT,
});

const db = getFirestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
app.use(express.json({ limit: "1mb" }));

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const ALLOWED_CATEGORIES = [
  "food",
  "grocery",
  "utilities",
  "rent",
  "tertier",
  "hedon",
  "other",
];

function verifySecret(req) {
  if (!WEBHOOK_SECRET) return false;
  const provided = req.get("x-webhook-secret");
  if (!provided) return false;

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(WEBHOOK_SECRET, "utf8");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

function toNativeDate(candidateDate, fallbackDate) {
  if (candidateDate && !Number.isNaN(Date.parse(candidateDate))) {
    return new Date(candidateDate);
  }
  if (fallbackDate && !Number.isNaN(Date.parse(fallbackDate))) {
    return new Date(fallbackDate);
  }
  return new Date();
}

async function extractTransactionWithGemini(emailPayload) {
  const prompt = `
Extract expense details from this IDR bank transaction email.

Rules:
1. "amount": always a positive number in IDR (strip "Rp", "IDR", spaces, and thousands separators like "." or "," — e.g., "Rp 45.000" -> 45000).
2. "category": pick the single best match from:
   - "food": meals, coffee, cafes, restaurants, food delivery
   - "grocery": supermarkets, minimarkets, groceries, raw ingredients
   - "utilities": electricity, water, internet, mobile/phone bills, gas, laundry, parking, admin fees
   - "rent": housing rent, kost/apartment lease, monthly property rental
   - "tertier": secondary/lifestyle upgrades, gadgets, clothing, non-essential shopping
   - "hedon": entertainment, nightlife, bars, concerts, indulgent treats/luxuries
   - "other": anything valid that does not fit above
3. "description": very short description of the expense (merchant or transaction purpose), strictly fewer than 5 words (maximum 4 words).
4. "date": transaction date/time in ISO-8601 format if stated in the email, or empty string "" to fall back to the email date.

Email From: ${emailPayload.from || "unknown"}
Email Subject: ${emailPayload.subject || ""}
Email Date: ${emailPayload.date || ""}
Email Body:
${String(emailPayload.body || "").slice(0, 6000)}
`.trim();

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          category: {
            type: Type.STRING,
            enum: ALLOWED_CATEGORIES,
          },
          date: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["amount", "category", "date", "description"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  return JSON.parse(text);
}

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "-expense-webhook" });
});

app.post("/webhook/email", async (req, res) => {
  try {
    if (!verifySecret(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageId, from, subject, date, body } = req.body || {};
    if (!body && !subject) {
      return res.status(400).json({ error: "Missing email subject or body" });
    }

    const dedupKey = messageId
      ? `email_${String(messageId).replace(/[^a-zA-Z0-9_-]/g, "_")}`
      : `hash_${crypto
          .createHash("sha256")
          .update(`${from}|${subject}|${date}|${body}`)
          .digest("hex")
          .slice(0, 28)}`;

    const docRef = db.collection("transactions").doc(dedupKey);
    const existing = await docRef.get();
    if (existing.exists) {
      return res.status(200).json({ status: "duplicate_skipped", id: dedupKey });
    }

    const extracted = await extractTransactionWithGemini({ from, subject, date, body });

    const parsedAmount = Number(extracted.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(422).json({ error: "Could not extract a positive IDR amount" });
    }

    const safeCategory = ALLOWED_CATEGORIES.includes(extracted.category)
      ? extracted.category
      : "other";

    // Matches CreateExpensePayload: { amount, category, date, description }
    const expensePayload = {
      amount: Math.abs(parsedAmount),
      category: safeCategory,
      date: toNativeDate(extracted.date, date),
      description: (extracted.description || "").trim(),
    };

    await docRef.set(expensePayload);

    return res.status(200).json({
      status: "created",
      id: dedupKey,
      expense: {
        id: dedupKey,
        ...expensePayload,
        date: expensePayload.date.toISOString(),
      },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Failed to process transaction email" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});