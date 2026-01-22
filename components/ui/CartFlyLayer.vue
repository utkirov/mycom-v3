<template>
  <teleport to="body">
    <div class="fixed inset-0 pointer-events-none z-[9999]">
      <div
          v-for="item in flyingItems"
          :key="item.id"
          class="absolute rounded-xl overflow-hidden shadow-xl border-2 border-white transition-all duration-700 ease-in-out"
          :style="item.style"
      >
        <img :src="item.image" class="w-full h-full object-cover">
      </div>
    </div>
  </teleport>
</template>

<script setup>
const { flyingItems } = useCartAnimation()
</script>

<style>
/* Глобальный стиль для "удара" по корзине */
@keyframes bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.animate-bump {
  animation: bump 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>