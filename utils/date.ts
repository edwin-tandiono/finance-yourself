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
  const inputDate = args?.date ?? new Date();

  const format = args?.format ?? 'YYYY-MM-DD';

  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthsLong = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const pad = (n: number, width = 2) => String(n).padStart(width, '0');

  const replacements: Record<string, string> = {
    'YYYY': String(inputDate.getFullYear()),
    'yyyy': String(inputDate.getFullYear()),
    'YY': String(inputDate.getFullYear()).slice(-2),
    'MMMM': monthsLong[inputDate.getMonth()],
    'MMM': monthsShort[inputDate.getMonth()],
    'MM': pad(inputDate.getMonth() + 1),
    'M': String(inputDate.getMonth() + 1),
    'DD': pad(inputDate.getDate()),
    'D': String(inputDate.getDate()),
  };

  return format.replace(/YYYY|yyyy|YY|MMMM|MMM|MM|M|DD|D|HH|hh|mm|ss/g, (match) => replacements[match] ?? match);
};
