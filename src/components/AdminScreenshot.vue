<template>
  <div class="max-w-5xl mx-auto mt-12">
    <div
      class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100/50"
    >
      <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >/glueful/api/v1/admin</span
          >
        </div>
      </div>

      <div class="pb-2">
        <img
          src="/images/admin-dashboard.png"
          alt="Glueful Admin Dashboard - Interactive API Management Interface"
          class="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AdminScreenshot',
})
</script>
