function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export function formatDate(date?: Date | null) {
  if (!date) return "";
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
}

function formatTime(date: Date) {
  return [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(
    ":",
  );
}

export function formatDateTime(date?: Date | null) {
  if (!date) return "";
  return formatDate(date) + " " + formatTime(date);
}

export function parseDate(s: string) {
  let [y, m, d] = s.split(/\D/).map((s) => parseInt(s));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
