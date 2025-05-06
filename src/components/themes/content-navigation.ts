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

const variant = [
  "pill",
  "link"
] as const

export default {
  "slots": {
    "root": "",
    "content": "data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] overflow-hidden focus:outline-none",
    "list": "isolate -mx-2.5 -mt-1.5",
    "item": "ps-1.5 -ms-px",
    "listWithChildren": "ms-5 border-s border-(--ui-border)",
    "itemWithChildren": "flex flex-col data-[state=open]:mb-1.5",
    "trigger": "font-semibold",
    "link": "group relative w-full px-2.5 py-1.5 before:inset-y-px before:inset-x-0 flex items-center gap-1.5 text-sm before:absolute before:z-[-1] before:rounded-[calc(var(--ui-radius)*1.5)] focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    "linkLeadingIcon": "shrink-0 size-5",
    "linkTrailing": "ms-auto inline-flex gap-1.5 items-center",
    "linkTrailingBadge": "shrink-0",
    "linkTrailingBadgeSize": "sm",
    "linkTrailingIcon": "size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180",
    "linkTitle": "truncate",
    "linkTitleExternalIcon": "size-3 align-top text-(--ui-text-dimmed)"
  },
  "variants": {
    "color": {
      "primary": {
        "trigger": "focus-visible:ring-(--ui-primary)",
        "link": "focus-visible:before:ring-(--ui-primary)"
      },
      "secondary": {
        "trigger": "focus-visible:ring-(--ui-secondary)",
        "link": "focus-visible:before:ring-(--ui-secondary)"
      },
      "success": {
        "trigger": "focus-visible:ring-(--ui-success)",
        "link": "focus-visible:before:ring-(--ui-success)"
      },
      "info": {
        "trigger": "focus-visible:ring-(--ui-info)",
        "link": "focus-visible:before:ring-(--ui-info)"
      },
      "warning": {
        "trigger": "focus-visible:ring-(--ui-warning)",
        "link": "focus-visible:before:ring-(--ui-warning)"
      },
      "error": {
        "trigger": "focus-visible:ring-(--ui-error)",
        "link": "focus-visible:before:ring-(--ui-error)"
      },
      "neutral": {
        "trigger": "focus-visible:ring-(--ui-border-inverted)",
        "link": "focus-visible:before:ring-(--ui-border-inverted)"
      }
    },
    "highlightColor": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "pill": "",
      "link": ""
    },
    "active": {
      "true": {
        "link": "font-medium"
      },
      "false": {
        "link": "text-(--ui-text-muted)",
        "linkLeadingIcon": "text-(--ui-text-dimmed)"
      }
    },
    "disabled": {
      "true": {
        "link": "cursor-not-allowed opacity-75"
      }
    },
    "highlight": {
      "true": {}
    },
    "level": {
      "true": {}
    }
  },
  "compoundVariants": [
    {
      "highlight": true,
      "level": true,
      "class": {
        "link": [
          "after:absolute after:-left-1.5 after:inset-y-0.5 after:block after:w-px after:rounded-full",
          "after:transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "pill" as typeof variant[number],
      "class": {
        "link": [
          "hover:text-(--ui-text-highlighted) hover:before:bg-(--ui-bg-elevated)/50 data-[state=open]:text-(--ui-text-highlighted)",
          "transition-colors before:transition-colors"
        ],
        "linkLeadingIcon": [
          "group-hover:text-(--ui-text) group-data-[state=open]:text-(--ui-text)",
          "transition-colors"
        ]
      }
    },
    {
      "color": "primary" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-primary)",
        "linkLeadingIcon": "text-(--ui-primary) group-data-[state=open]:text-(--ui-primary)"
      }
    },
    {
      "color": "secondary" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-secondary)",
        "linkLeadingIcon": "text-(--ui-secondary) group-data-[state=open]:text-(--ui-secondary)"
      }
    },
    {
      "color": "success" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-success)",
        "linkLeadingIcon": "text-(--ui-success) group-data-[state=open]:text-(--ui-success)"
      }
    },
    {
      "color": "info" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-info)",
        "linkLeadingIcon": "text-(--ui-info) group-data-[state=open]:text-(--ui-info)"
      }
    },
    {
      "color": "warning" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-warning)",
        "linkLeadingIcon": "text-(--ui-warning) group-data-[state=open]:text-(--ui-warning)"
      }
    },
    {
      "color": "error" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-error)",
        "linkLeadingIcon": "text-(--ui-error) group-data-[state=open]:text-(--ui-error)"
      }
    },
    {
      "color": "neutral" as typeof color[number],
      "variant": "pill" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-text-highlighted)",
        "linkLeadingIcon": "text-(--ui-text-highlighted) group-data-[state=open]:text-(--ui-text-highlighted)"
      }
    },
    {
      "variant": "pill" as typeof variant[number],
      "active": true,
      "highlight": false,
      "class": {
        "link": "before:bg-(--ui-bg-elevated)"
      }
    },
    {
      "variant": "pill" as typeof variant[number],
      "active": true,
      "highlight": true,
      "class": {
        "link": [
          "hover:before:bg-(--ui-bg-elevated)/50",
          "before:transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "link" as typeof variant[number],
      "class": {
        "link": [
          "hover:text-(--ui-text-highlighted) data-[state=open]:text-(--ui-text-highlighted)",
          "transition-colors"
        ],
        "linkLeadingIcon": [
          "group-hover:text-(--ui-text) group-data-[state=open]:text-(--ui-text)",
          "transition-colors"
        ]
      }
    },
    {
      "color": "primary" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-primary)",
        "linkLeadingIcon": "text-(--ui-primary) group-data-[state=open]:text-(--ui-primary)"
      }
    },
    {
      "color": "secondary" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-secondary)",
        "linkLeadingIcon": "text-(--ui-secondary) group-data-[state=open]:text-(--ui-secondary)"
      }
    },
    {
      "color": "success" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-success)",
        "linkLeadingIcon": "text-(--ui-success) group-data-[state=open]:text-(--ui-success)"
      }
    },
    {
      "color": "info" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-info)",
        "linkLeadingIcon": "text-(--ui-info) group-data-[state=open]:text-(--ui-info)"
      }
    },
    {
      "color": "warning" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-warning)",
        "linkLeadingIcon": "text-(--ui-warning) group-data-[state=open]:text-(--ui-warning)"
      }
    },
    {
      "color": "error" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-error)",
        "linkLeadingIcon": "text-(--ui-error) group-data-[state=open]:text-(--ui-error)"
      }
    },
    {
      "color": "neutral" as typeof color[number],
      "variant": "link" as typeof variant[number],
      "active": true,
      "class": {
        "link": "text-(--ui-text-highlighted)",
        "linkLeadingIcon": "text-(--ui-text-highlighted) group-data-[state=open]:text-(--ui-text-highlighted)"
      }
    },
    {
      "highlightColor": "primary" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-primary)"
      }
    },
    {
      "highlightColor": "secondary" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-secondary)"
      }
    },
    {
      "highlightColor": "success" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-success)"
      }
    },
    {
      "highlightColor": "info" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-info)"
      }
    },
    {
      "highlightColor": "warning" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-warning)"
      }
    },
    {
      "highlightColor": "error" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-error)"
      }
    },
    {
      "highlightcolor": "neutral",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-(--ui-bg-inverted)"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary" as typeof color[number],
    "highlightColor": "primary" as typeof highlightColor[number],
    "variant": "pill" as typeof variant[number]
  }
}