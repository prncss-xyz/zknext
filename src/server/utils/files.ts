import { constants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path/posix";

// recursively list files with path relative to basedir, skipping hidden (.*) files and dirs
export async function* getFiles(
  basedir: string,
  dir = "",
): AsyncGenerator<string> {
  const entries = await fs.readdir(path.join(basedir, dir), {
    withFileTypes: true,
  });
  for (const file of entries) {
    if (file.name.startsWith(".")) continue;
    if (file.isDirectory()) {
      yield* getFiles(basedir, path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

// test if file exists
export async function exists(path: string) {
  try {
    await fs.access(path, constants.F_OK);
  } catch (err) {
    return false;
  }
  return true;
}
