const orientation = [
  "horizontal",
  "vertical"
] as const

const variant = [
  "solid",
  "outline",
  "soft",
  "subtle",
  "naked"
] as const

export default {
  "slots": {
    "root": "relative isolate rounded-[calc(var(--ui-radius)*3)] overflow-hidden",
    "container": "flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16",
    "wrapper": "",
    "title": "text-3xl sm:text-4xl text-pretty tracking-tight font-bold text-(--ui-text-highlighted)",
    "description": "text-base sm:text-lg text-(--ui-text-muted)",
    "links": "mt-8 flex flex-wrap gap-x-6 gap-y-3"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center",
        "description": "text-pretty"
      },
      "vertical": {
        "container": "",
        "title": "text-center",
        "description": "text-center text-balance",
        "links": "justify-center"
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
      "naked": {
        "description": "text-(--ui-text-muted)"
      }
    },
    "title": {
      "true": {
        "description": "mt-6"
      }
    }
  },
  "defaultVariants": {
    "variant": "outline" as typeof variant[number]
  }
}