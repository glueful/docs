export function getSlotChildrenText(children) {
  return children.map((node) => {
    if (!node.children || typeof node.children === "string") return node.children || "";
    else if (Array.isArray(node.children)) return getSlotChildrenText(node.children);
    else if (node.children.default) return getSlotChildrenText(node.children.default());
  }).join("");
}
export function transformUI(ui) {
  return Object.entries(ui).reduce((acc, [key, value]) => {
    acc[key] = typeof value === "function" ? value() : value;
    return acc;
  }, {});
}
export * from "./content.js";
