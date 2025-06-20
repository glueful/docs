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
    "list": "space-y-1",
    "item": "",
    "listWithChildren": "mt-2 ml-3 pl-3",
    "itemWithChildren": "flex flex-col relative",
    "trigger": "font-medium text-gray-900 dark:text-gray-100",
    "link": "group relative w-full pl-6 pr-3 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "linkLeadingIcon": "shrink-0 size-4 text-gray-400 dark:text-gray-500",
    "linkTrailing": "ms-auto inline-flex gap-1.5 items-center",
    "linkTrailingBadge": "shrink-0",
    "linkTrailingBadgeSize": "xs",
    "linkTrailingIcon": "size-4 transform transition-transform duration-200 shrink-0 text-gray-400 dark:text-gray-500 group-data-[state=open]:rotate-90",
    "linkTitle": "truncate",
    "linkTitleExternalIcon": "size-3 align-top text-gray-400 dark:text-gray-500 ml-1"
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
        "link": "text-blue-600 dark:text-blue-400 font-medium",
        "linkLeadingIcon": "text-blue-600 dark:text-blue-400"
      },
      "false": {
        "link": "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100",
        "linkLeadingIcon": "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
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
    },
    "showMainBorder": {
      "true": {},
      "false": {}
    }
  },
  "compoundVariants": [
    {
      "level": true,
      "class": {
        "link": "pl-4 font-normal"
      }
    },
    {
      "showMainBorder": true,
      "class": {
        "itemWithChildren": "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-200 dark:before:bg-gray-800"
      }
    },
    {
      "highlight": true,
      "level": true,
      "class": {
        "link": [
          "before:absolute before:-left-6 before:top-1.5 before:bottom-1.5 before:block before:w-[0.15rem] before:z-10 before:scale-y-0 before:origin-center",
          "before:transition-all before:duration-300 before:ease-out",
          "hover:before:scale-y-100 hover:before:bg-gray-300 dark:hover:before:bg-gray-600"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "pill" as typeof variant[number],
      "class": {
        "link": [
          "hover:text-gray-900 dark:hover:text-gray-100 data-[state=open]:text-gray-900 dark:data-[state=open]:text-gray-100",
          "transition-colors duration-200"
        ],
        "linkLeadingIcon": [
          "group-hover:text-gray-600 dark:group-hover:text-gray-400 group-data-[state=open]:text-gray-600 dark:group-data-[state=open]:text-gray-400",
          "transition-colors duration-200"
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
        "link": "text-blue-600 dark:text-blue-400 font-medium"
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
        "link": "before:bg-(--ui-primary) before:scale-y-100 hover:before:bg-(--ui-primary)"
      }
    },
    {
      "highlightColor": "secondary" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-secondary) before:scale-y-100 hover:before:bg-(--ui-secondary)"
      }
    },
    {
      "highlightColor": "success" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-success) before:scale-y-100 hover:before:bg-(--ui-success)"
      }
    },
    {
      "highlightColor": "info" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-info) before:scale-y-100 hover:before:bg-(--ui-info)"
      }
    },
    {
      "highlightColor": "warning" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-warning) before:scale-y-100 hover:before:bg-(--ui-warning)"
      }
    },
    {
      "highlightColor": "error" as typeof highlightColor[number],
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-error) before:scale-y-100 hover:before:bg-(--ui-error)"
      }
    },
    {
      "highlightcolor": "neutral",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "before:bg-(--ui-bg-inverted) before:scale-y-100 hover:before:bg-(--ui-bg-inverted)"
      }
    },
  ],
  "defaultVariants": {
    "color": "primary" as typeof color[number],
    "highlightColor": "primary" as typeof highlightColor[number],
    "variant": "pill" as typeof variant[number]
  }
}