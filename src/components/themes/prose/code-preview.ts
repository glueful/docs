export default {
  "slots": {
    "root": "my-5",
    "preview": "flex justify-center border border-(--ui-border-muted) relative p-4 rounded-[calc(var(--ui-radius)*1.5)]",
    "code": "[&>div>pre]:rounded-t-none [&>div]:my-0"
  },
  "variants": {
    "code": {
      "true": {
        "preview": "border-b-0 rounded-b-none"
      }
    }
  }
}