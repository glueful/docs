export default {
  "slots": {
    "root": "flex flex-col gap-3",
    "title": "text-sm font-semibold flex items-center gap-1.5",
    "list": "flex flex-col gap-2",
    "item": "relative",
    "link": "group text-sm flex items-center gap-1.5 focus-visible:outline-(--ui-primary)",
    "linkLeadingIcon": "size-5 shrink-0",
    "linkLabel": "truncate",
    "linkLabelExternalIcon": "size-3 absolute top-0 text-(--ui-text-dimmed)"
  },
  "variants": {
    "active": {
      "true": {
        "link": "text-(--ui-primary) font-medium"
      },
      "false": {
        "link": [
          "text-(--ui-text-muted) hover:text-(--ui-text)",
          "transition-colors"
        ]
      }
    }
  }
}