export default {
  "slots": {
    "root": "",
    "list": "",
    "item": "relative",
    "link": "group text-sm flex items-center gap-1.5 py-1 focus-visible:outline-(--ui-primary)",
    "linkLeading": "rounded-[calc(var(--ui-radius)*1.5)] p-1 inline-flex ring-inset ring",
    "linkLeadingIcon": "size-4 shrink-0",
    "linkLabel": "truncate",
    "linkLabelExternalIcon": "size-3 absolute top-0 text-(--ui-text-dimmed)"
  },
  "variants": {
    "active": {
      "true": {
        "link": "text-(--ui-primary) font-semibold",
        "linkLeading": "bg-(--ui-primary) ring-(--ui-primary) text-(--ui-bg)"
      },
      "false": {
        "link": [
          "text-(--ui-text-muted) hover:text-(--ui-text) font-medium",
          "transition-colors"
        ],
        "linkLeading": [
          "bg-(--ui-bg-elevated)/50 ring-(--ui-border-accented) text-(--ui-text-dimmed) group-hover:bg-(--ui-primary) group-hover:ring-(--ui-primary) group-hover:text-(--ui-bg)",
          "transition"
        ]
      }
    }
  }
}