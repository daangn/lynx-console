export type StyleObject = Record<string, string>;

const DANGEROUS_VALUE = /url\s*\(|expression\s*\(|@import/i;

const toCamelCase = (name: string): string => {
  if (name.startsWith("--")) return name;
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
};

export const parseCssString = (css: string): StyleObject => {
  const result: StyleObject = {};
  for (const raw of css.split(";")) {
    const decl = raw.trim();
    if (!decl) continue;
    const colon = decl.indexOf(":");
    if (colon <= 0) continue;
    const name = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    if (!name || !value) continue;
    if (DANGEROUS_VALUE.test(value)) continue;
    result[toCamelCase(name)] = value;
  }
  return result;
};
