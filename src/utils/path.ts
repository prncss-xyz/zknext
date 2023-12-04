export const sep = "/";

export function upDirs(id: string) {
  const res: string[] = [];
  const segments = id.split(sep);
  for (let i = 0; i < segments.length; i++)
    res.push(segments.slice(0, i).join(sep));
  return res;
}

export function dirname(filepath: string) {
  const index = filepath.lastIndexOf(sep);
  if (index === -1) return "";
  return filepath.slice(0, index);
}

export function normalizePath(path: string) {
  return path.replace(/\\/g, sep);
}
