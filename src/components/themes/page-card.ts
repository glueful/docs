const orientation = [
  "horizontal",
  "vertical"
] as const

const variant = [
  "solid",
  "outline",
  "soft",
  "subtle",
  "ghost",
  "naked"
] as const

export default {
  "slots": {
    "root": "relative group flex rounded-[calc(var(--ui-radius)*2)]",
    "spotlight": "absolute inset-0 rounded-[inherit] pointer-events-none bg-(--ui-bg)/90",
    "container": "relative flex flex-col flex-1 lg:grid gap-x-8 gap-y-4 p-4 sm:p-6",
    "wrapper": "",
    "header": "mb-4",
    "body": "",
    "footer": "mt-4",
    "leading": "inline-flex items-center justify-center mb-2.5",
    "leadingIcon": "size-5 shrink-0 text-(--ui-primary)",
    "title": "text-base text-pretty font-semibold text-(--ui-text-highlighted)",
    "description": "text-[15px] text-pretty"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center"
      },
      "vertical": {
        "container": ""
      }
    },
    "reverse": {
      "true": {
        "wrapper": "lg:order-last"
      }
    },
    "variant": {
      "solid": {
        "root": "bg-(--ui-bg-inverted) text-(--ui-bg)",
        "title": "text-(--ui-bg)",
        "description": "text-(--ui-text-dimmed)"
      },
      "outline": {
        "root": "bg-(--ui-bg) ring ring-(--ui-border)",
        "description": "text-(--ui-text-muted)"
      },
      "soft": {
        "root": "bg-(--ui-bg-elevated)/50",
        "description": "text-(--ui-text-toned)"
      },
      "subtle": {
        "root": "bg-(--ui-bg-elevated)/50 ring ring-(--ui-border)",
        "description": "text-(--ui-text-toned)"
      },
      "ghost": {
        "description": "text-(--ui-text-muted)"
      },
      "naked": {
        "container": "p-0 sm:p-0",
        "description": "text-(--ui-text-muted)"
      }
    },
    "to": {
      "true": {
        "root": [
          "transition"
        ]
      }
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    },
    "highlight": {
      "true": {
        "root": "ring-2 ring-(--ui-primary)"
      }
    },
    "spotlight": {
      "true": {
        "root": "[--spotlight-size:400px] [--spotlight-color:var(--ui-primary)] before:absolute before:-inset-px before:pointer-events-none before:rounded-[inherit] before:bg-[radial-gradient(var(--spotlight-size)_var(--spotlight-size)_at_calc(var(--spotlight-x,0px))_calc(var(--spotlight-y,0px)),var(--spotlight-color),transparent_70%)]"
      }
    }
  },
  "compoundVariants": [
    {
      "variant": "solid" as typeof variant[number],
      "to": true,
      "class": {
        "root": "hover:bg-(--ui-bg-inverted)/90"
      }
    },
    {
      "variant": "outline" as typeof variant[number],
      "to": true,
      "class": {
        "root": "hover:bg-(--ui-bg-elevated)/50"
      }
    },
    {
      "variant": "soft" as typeof variant[number],
      "to": true,
      "class": {
        "root": "hover:bg-(--ui-bg-elevated)"
      }
    },
    {
      "variant": "subtle" as typeof variant[number],
      "to": true,
      "class": {
        "root": "hover:bg-(--ui-bg-elevated)"
      }
    },
    {
      "variant": "subtle" as typeof variant[number],
      "to": true,
      "highlight": false,
      "class": {
        "root": "hover:ring-(--ui-border-accented)"
      }
    },
    {
      "variant": "ghost" as typeof variant[number],
      "to": true,
      "class": {
        "root": "hover:bg-(--ui-bg-elevated)/50"
      }
    }
  ],
  "defaultVariants": {
    "variant": "outline" as typeof variant[number]
  }
}