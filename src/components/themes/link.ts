export default {
  "base": "focus-visible:outline-primary",
  "variants": {
    "active": {
      "true": "text-primary",
      "false": [
        "text-muted hover:text-default",
        "transition-colors"
      ]
    },
    "disabled": {
      "true": "cursor-not-allowed opacity-75"
    }
  }
}