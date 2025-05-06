<template>
  <div class="relative group [&>pre]:rounded-t-none [&>pre]:my-0 my-5">
    <!-- File Header -->
    <div
      class="flex items-center gap-1.5 border border-muted bg-default border-b-0 relative rounded-t-md px-4 py-3 justify-between"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-terminal" class="size-4" />
        <span class="text-default text-sm/6">Terminal</span>
      </div>

      <!-- Copy Button -->
      <UButton icon="i-lucide-copy" size="md" color="primary" variant="outline" />
    </div>

    <slot />
  </div>
</template>
