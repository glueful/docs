export default {
  "slots": {
    "root": "relative group *:not-first:!my-0 *:not-first:!static my-5",
    "list": "relative flex items-center gap-1 border border-(--ui-border-muted) bg-(--ui-bg) border-b-0 rounded-t-[calc(var(--ui-radius)*1.5)] overflow-x-auto p-2",
    "indicator": "absolute left-0 inset-y-2 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) transition-[translate,width] duration-200 bg-(--ui-bg-elevated) rounded-[calc(var(--ui-radius)*1.5)] shadow-xs",
    "trigger": [
      "relative inline-flex items-center gap-1.5 text-(--ui-text) data-[state=active]:text-(--ui-text-highlighted) hover:bg-(--ui-bg-elevated)/50 px-2 py-1.5 text-sm rounded-[calc(var(--ui-radius)*1.5)] disabled:cursor-not-allowed disabled:opacity-75 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--ui-primary) focus:outline-none",
      "transition-colors"
    ],
    "triggerIcon": "size-4 shrink-0",
    "triggerLabel": "truncate"
  }
}