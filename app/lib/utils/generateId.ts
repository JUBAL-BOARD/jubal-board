export const generateId = (prefix: "dm" | "group") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};