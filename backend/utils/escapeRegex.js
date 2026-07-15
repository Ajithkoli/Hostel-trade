export const escapeRegex = (string) => {
  if (!string || typeof string !== "string") return "";
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
