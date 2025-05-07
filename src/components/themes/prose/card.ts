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
  "slots": {
    "base": [
      "group relative block p-4 sm:p-6 border border-(--ui-border) rounded-[calc(var(--ui-radius)*1.5)] bg-(--ui-bg)",
      "transition-colors"
    ],
    "icon": "size-6 mb-2 block",
    "title": "text-(--ui-text-highlighted) font-semibold",
    "description": "text-[15px] text-(--ui-text-muted)",
    "externalIcon": [
      "size-4 align-top absolute right-2 top-2 text-(--ui-text-dimmed) pointer-events-none",
      "transition-colors"
    ]
  },
  "variants": {
    "color": {
      "primary": {
        "icon": "text-(--ui-primary)"
      },
      "secondary": {
        "icon": "text-(--ui-secondary)"
      },
      "success": {
        "icon": "text-(--ui-success)"
      },
      "info": {
        "icon": "text-(--ui-info)"
      },
      "warning": {
        "icon": "text-(--ui-warning)"
      },
      "error": {
        "icon": "text-(--ui-error)"
      },
      "neutral": {
        "icon": "text-(--ui-text-highlighted)"
      }
    },
    "to": {
      "true": ""
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-primary)/10 hover:border-(--ui-primary)",
        "externalIcon": "group-hover:text-(--ui-primary)"
      }
    },
    {
      "color": "secondary" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-secondary)/10 hover:border-(--ui-secondary)",
        "externalIcon": "group-hover:text-(--ui-secondary)"
      }
    },
    {
      "color": "success" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-success)/10 hover:border-(--ui-success)",
        "externalIcon": "group-hover:text-(--ui-success)"
      }
    },
    {
      "color": "info" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-info)/10 hover:border-(--ui-info)",
        "externalIcon": "group-hover:text-(--ui-info)"
      }
    },
    {
      "color": "warning" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-warning)/10 hover:border-(--ui-warning)",
        "externalIcon": "group-hover:text-(--ui-warning)"
      }
    },
    {
      "color": "error" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-error)/10 hover:border-(--ui-error)",
        "externalIcon": "group-hover:text-(--ui-error)"
      }
    },
    {
      "color": "neutral" as typeof color[number],
      "to": true,
      "class": {
        "base": "hover:bg-(--ui-bg-elevated)/50 hover:border-(--ui-border-inverted)",
        "externalIcon": "group-hover:text-(--ui-text-highlighted)"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary" as typeof color[number]
  }
}