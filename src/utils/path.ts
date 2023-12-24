export const sep = "/";

export function contains(dir: string, value: string) {
  if (!dir) return true;
  if (dir === value) return true;
  if (value.startsWith(dir + sep)) return true;
  return false;
}

export function upDirs(incl: boolean, id: string) {
  const res: string[] = [];
  const segments = id.split(sep);
  const len = segments.length + (incl ? 1 : 0);
  for (let i = 0; i < len; i++) res.push(segments.slice(0, i).join(sep));
  return res;
}

export function basename(filepath: string) {
  const index = filepath.lastIndexOf(sep);
  if (index === -1) return filepath;
  return filepath.slice(index + sep.length);
}

export function dirname(filepath: string) {
  const index = filepath.lastIndexOf(sep);
  if (index === -1) return "";
  return filepath.slice(0, index);
}

export function normalizePath(path: string) {
  return path.replace(/\\/g, sep);
}
