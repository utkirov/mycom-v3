<template>
  <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
    <h2 class="text-xl font-bold text-brand-dark-blue mb-6 flex items-center gap-2">
      <Icon name="ph:shopping-bag-fill" class="text-brand-blue" />
      {{ $t('checkout.order_content') }}
    </h2>

    <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      <div v-for="item in cartStore.cart" :key="item.id" class="flex gap-4 py-3 border-b border-gray-50 last:border-0">
        <NuxtLink :to="localePath(`/product/${item.slug || item.id}`)" class="h-16 w-16 shrink-0 bg-gray-50 rounded-xl p-1 border border-gray-100">
          <img :src="item.image" :alt="item.name" class="h-full w-full object-contain mix-blend-multiply">
        </NuxtLink>

        <div class="flex-grow min-w-0">
          <NuxtLink :to="localePath(`/product/${item.slug || item.id}`)" class="text-sm font-bold text-brand-dark-blue line-clamp-1 hover:text-brand-blue transition-colors">
            {{ item.name }}
          </NuxtLink>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-gray-500 font-medium">
              {{ item.quantity }} {{ $t('checkout.pcs') }} × {{ format(item.price) }}
            </span>
            <span class="text-sm font-black text-brand-blue">
              {{ format(item.price * item.quantity) }} <span class="text-[10px]">сум</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const cartStore = useCartStore();
const { format } = useCurrency();
const localePath = useLocalePath();
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>