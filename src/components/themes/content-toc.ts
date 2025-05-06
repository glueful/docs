const color = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "error",
  "neutral"
] as const

const highlightColor = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "error",
  "neutral"
] as const

export default {
  "slots": {
    "root": "sticky top-(--ui-header-height) bg-(--ui-bg)/75 lg:bg-[initial] backdrop-blur -mx-4 px-4 sm:px-6 sm:-mx-6 overflow-y-auto max-h-[calc(100vh-var(--ui-header-height))]",
    "container": "pt-4 sm:pt-6 pb-2.5 sm:pb-4.5 lg:py-8 border-b border-dashed border-(--ui-border) lg:border-0 flex flex-col",
    "top": "",
    "bottom": "mt-6 hidden lg:flex lg:flex-col gap-6",
    "trigger": "group text-sm font-semibold flex-1 flex items-center gap-1.5 py-1.5 -mt-1.5 focus-visible:outline-(--ui-primary)",
    "title": "truncate",
    "trailing": "ms-auto inline-flex gap-1.5 items-center",
    "trailingIcon": "size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180 lg:hidden",
    "content": "data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden focus:outline-none",
    "list": "",
    "listWithChildren": "ms-3",
    "item": "",
    "itemWithChildren": "",
    "link": "group text-sm block truncate focus-visible:outline-(--ui-primary) py-1",
    "indicator": "absolute ms-2.5 transition-[translate,height] duration-200 h-(--indicator-size) translate-y-(--indicator-position) w-px rounded-full"
  },
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "highlightColor": {
      "primary": {
        "indicator": "bg-(--ui-primary)"
      },
      "secondary": {
        "indicator": "bg-(--ui-secondary)"
      },
      "success": {
        "indicator": "bg-(--ui-success)"
      },
      "info": {
        "indicator": "bg-(--ui-info)"
      },
      "warning": {
        "indicator": "bg-(--ui-warning)"
      },
      "error": {
        "indicator": "bg-(--ui-error)"
      },
      "neutral": {
        "indicator": "bg-(--ui-bg-inverted)"
      }
    },
    "active": {
      "false": {
        "link": [
          "text-(--ui-text-muted) hover:text-(--ui-text)",
          "transition-colors"
        ]
      }
    },
    "highlight": {
      "true": {
        "list": "ms-2.5 ps-4 border-s border-(--ui-border)",
        "item": "-ms-px"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-primary)",
        "linkLeadingIcon": "text-(--ui-primary)"
      }
    },
    {
      "color": "secondary" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-secondary)",
        "linkLeadingIcon": "text-(--ui-secondary)"
      }
    },
    {
      "color": "success" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-success)",
        "linkLeadingIcon": "text-(--ui-success)"
      }
    },
    {
      "color": "info" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-info)",
        "linkLeadingIcon": "text-(--ui-info)"
      }
    },
    {
      "color": "warning" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-warning)",
        "linkLeadingIcon": "text-(--ui-warning)"
      }
    },
    {
      "color": "error" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-error)",
        "linkLeadingIcon": "text-(--ui-error)"
      }
    },
    {
      "color": "neutral" as typeof color[number],
      "active": true,
      "class": {
        "link": "text-(--ui-text-highlighted)",
        "linkLeadingIcon": "text-(--ui-text-highlighted)"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary" as typeof color[number],
    "highlightColor": "primary" as typeof highlightColor[number]
  }
}