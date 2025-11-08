import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Finance Yourself" },
    { name: "description", content: "You should finance yourself NOW" },
  ];
}

export default function Home() {
  return <Welcome />;
}
