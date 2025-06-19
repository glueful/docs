<template>
  <div
    class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg shadow-indigo-100/50"
  >
    <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >UserController.php</span
          >
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>PHP 8.2+</span>
        </div>
      </div>
    </div>

    <div class="p-6">
      <pre
        class="text-sm leading-relaxed overflow-x-auto text-gray-900 dark:text-gray-100 text-left"
      ><code><span class="text-purple-600 dark:text-purple-400">class</span> <span class="text-blue-600 dark:text-blue-400">UserController</span> <span class="text-purple-600 dark:text-purple-400">extends</span> <span class="text-blue-600 dark:text-blue-400">BaseController</span>
{
    <span class="text-purple-600 dark:text-purple-400">public function</span> <span class="text-blue-600 dark:text-blue-400">__construct</span>(
        <span class="text-purple-600 dark:text-purple-400">private</span> <span class="text-blue-600 dark:text-blue-400">UserService</span> <span class="text-gray-700 dark:text-gray-300">$userService</span>
    ) {}

    <!-- <span class="text-gray-500 dark:text-gray-400">#[RequiresAuth]</span> -->
    <span class="text-purple-600 dark:text-purple-400">public function</span> <span class="text-blue-600 dark:text-blue-400">create</span>(<span class="text-blue-600 dark:text-blue-400">Request</span> <span class="text-gray-700 dark:text-gray-300">$request</span>): <span class="text-blue-600 dark:text-blue-400">Response</span>
    {
        <span class="text-gray-700 dark:text-gray-300">$user</span> = <span class="text-gray-700 dark:text-gray-300">$this</span>-><span class="text-blue-600 dark:text-blue-400">userService</span>-><span class="text-blue-600 dark:text-blue-400">createUser</span>(<span class="text-gray-700 dark:text-gray-300">$request</span>-><span class="text-blue-600 dark:text-blue-400">validated</span>());

        <span class="text-purple-600 dark:text-purple-400">return</span> <span class="text-blue-600 dark:text-blue-400">Response</span>::<span class="text-blue-600 dark:text-blue-400">created</span>(<span class="text-gray-700 dark:text-gray-300">$user</span>);
    }
}</code></pre>
    </div>

    <div class="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="grid grid-cols-3 gap-2">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Type Safety</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Auto DI</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Attributes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CleanCodeShowcase',
})
</script>
