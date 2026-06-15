export const validateMonth = (month?: number) => {
  const now = new Date();

  return Number.isInteger(month ?? now.getMonth() + 1)
    ? Math.min(12, Math.max(1, month as number))
    : (now.getMonth() + 1);
};

export const validateYear = (year?: number) => {
  const now = new Date();

  return Number.isInteger(year)
    ? (year as number)
    : now.getFullYear();
};

export const format = (args?: { date?: Date, format?: string }): string => {
  const date = args?.date ?? new Date();
  const format = args?.format ?? 'YYYY-MM-DD';

  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthsLong = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const pad = (n: number, width = 2) => String(n).padStart(width, '0');

  const replacements: Record<string, string> = {
    'YYYY': String(date.getFullYear()),
    'yyyy': String(date.getFullYear()),
    'YY': String(date.getFullYear()).slice(-2),
    'MMMM': monthsLong[date.getMonth()],
    'MMM': monthsShort[date.getMonth()],
    'MM': pad(date.getMonth() + 1),
    'M': String(date.getMonth() + 1),
    'DD': pad(date.getDate()),
    'D': String(date.getDate()),
  };

  return format.replace(/YYYY|yyyy|YY|MMMM|MMM|MM|M|DD|D|HH|hh|mm|ss/g, (match) => replacements[match] ?? match);
};

export const groupByDate = <T>({ items, getDate }: { items: T[]; getDate: (item: T) => Date }): Record<string, T[]> => {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const d = getDate(item) ?? new Date();
    const key = format({ date: d, format: 'YYYY-MM-DD' });

    if (!acc[key]) acc[key] = [];

    acc[key].push(item);

    return acc;
  }, {});
};
