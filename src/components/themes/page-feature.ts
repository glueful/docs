const orientation = [
  "horizontal",
  "vertical"
] as const

export default {
  "slots": {
    "root": "relative",
    "wrapper": "",
    "leading": "inline-flex items-center justify-center",
    "leadingIcon": "size-5 shrink-0 text-(--ui-primary)",
    "title": "text-base text-pretty font-semibold text-(--ui-text-highlighted)",
    "description": "text-[15px] text-pretty text-(--ui-text-muted)"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "root": "flex items-start gap-2.5",
        "leading": "p-0.5"
      },
      "vertical": {
        "leading": "mb-2.5"
      }
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    }
  }
}