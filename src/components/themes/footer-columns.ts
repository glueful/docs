export default {
  "slots": {
    "root": "xl:grid xl:grid-cols-3 xl:gap-8",
    "left": "mb-10 xl:mb-0",
    "center": "flex flex-col lg:grid grid-flow-col auto-cols-fr gap-8 xl:col-span-2",
    "right": "mt-10 xl:mt-0",
    "label": "text-sm font-semibold",
    "list": "mt-6 space-y-4",
    "item": "relative",
    "link": "group text-sm flex items-center gap-1.5 focus-visible:outline-(--ui-primary)",
    "linkLeadingIcon": "size-5 shrink-0",
    "linkLabel": "truncate",
    "linkLabelExternalIcon": "size-3 absolute top-0 text-(--ui-text-dimmed) inline-block"
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