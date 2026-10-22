import { createStudio } from "./create/index.js";
import { growStudio } from "./grow/index.js";
import { hireStudio } from "./hire/index.js";
import { automateStudio } from "./automate/index.js";
import { supportStudio } from "./support/index.js";

/** The five studios, in the order they appear everywhere in the product. */
export const studios = [createStudio, growStudio, hireStudio, automateStudio, supportStudio];

export const studioByKey = Object.fromEntries(studios.map((s) => [s.key, s]));

/** Resolve a pathname to the studio that owns it, or null. */
export function studioForPath(pathname) {
  return studios.find((s) => pathname.startsWith(s.base))?.key ?? null;
}
