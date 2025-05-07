const color = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "error",
  "neutral"
] as const

export default {
  "base": "px-1.5 py-0.5 text-sm font-mono font-medium rounded-[calc(var(--ui-radius)*1.5)] inline-block",
  "variants": {
    "color": {
      "primary": "border border-(--ui-primary)/25 bg-(--ui-primary)/10 text-(--ui-primary)",
      "secondary": "border border-(--ui-secondary)/25 bg-(--ui-secondary)/10 text-(--ui-secondary)",
      "success": "border border-(--ui-success)/25 bg-(--ui-success)/10 text-(--ui-success)",
      "info": "border border-(--ui-info)/25 bg-(--ui-info)/10 text-(--ui-info)",
      "warning": "border border-(--ui-warning)/25 bg-(--ui-warning)/10 text-(--ui-warning)",
      "error": "border border-(--ui-error)/25 bg-(--ui-error)/10 text-(--ui-error)",
      "neutral": "border border-(--ui-border-muted) text-(--ui-text-highlighted) bg-(--ui-bg-muted)"
    }
  },
  "defaultVariants": {
    "color": "neutral" as typeof color[number]
  }
}