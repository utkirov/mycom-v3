<template>
  <div class="bg-gray-50/50 min-h-screen py-8 md:py-12">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto">

      <h1 class="text-3xl font-black text-brand-dark-blue mb-8 flex items-center gap-3">
        {{ $t('cart.title') }}
        <span v-if="cartStore.cartCount" class="text-lg font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
          {{ cartStore.cartCount }}
        </span>
      </h1>

      <div v-if="cartStore.cartCount > 0" class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 space-y-4">
          <div v-for="item in cartStore.cart" :key="item.id"
               class="bg-white rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group transition-all hover:border-brand-blue/20">

            <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="h-24 w-24 shrink-0 bg-gray-50 rounded-2xl p-2 flex items-center justify-center">
              <img :src="item.image" :alt="item.name" class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform group-hover:scale-105">
            </NuxtLink>

            <div class="flex-grow text-center md:text-left">
              <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="text-base font-bold text-brand-dark-blue hover:text-brand-blue transition-colors line-clamp-2 mb-2">
                {{ item.name }}
              </NuxtLink>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {{ $t('product.sku') || 'Артикул' }}: {{ item.id }}
              </div>
            </div>

            <div class="flex flex-col items-center gap-4 md:items-end md:min-w-[200px]">
              <div class="flex items-center gap-4 bg-gray-50 p-1 rounded-2xl ring-1 ring-gray-100">
                <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                        class="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-brand-blue hover:bg-brand-blue hover:text-white transition-all active:scale-90">
                  <Icon name="ph:minus-bold" />
                </button>
                <span class="w-8 text-center font-black text-brand-dark-blue">{{ item.quantity }}</span>
                <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                        class="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-brand-blue hover:bg-brand-blue hover:text-white transition-all active:scale-90">
                  <Icon name="ph:plus-bold" />
                </button>
              </div>

              <div class="text-right">
                <div class="text-lg font-black text-brand-blue whitespace-nowrap">
                  {{ format(item.price * item.quantity) }} <span class="text-xs">сум</span>
                </div>
                <button @click="cartStore.removeFromCart(item.id)" class="text-xs font-bold text-brand-red opacity-60 hover:opacity-100 transition-opacity mt-1">
                  {{ $t('cart.delete') }}
                </button>
              </div>
            </div>
          </div>

          <button @click="cartStore.clearCart()" class="text-sm font-bold text-gray-400 hover:text-brand-red flex items-center gap-2 mx-auto md:mx-0 transition-colors">
            <Icon name="ph:trash" />
            {{ $t('cart.clear_cart') }}
          </button>
        </div>

        <div class="w-full lg:w-80 shrink-0">
          <div class="bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg sticky top-24">
            <h3 class="text-xl font-black text-brand-dark-blue mb-6">{{ $t('cart.total') }}</h3>

            <div class="space-y-4 mb-8">
              <div class="flex justify-between text-sm text-gray-500">
                <span>{{ $t('cart.items_count', { n: cartStore.cartCount }) }}</span>
                <span class="font-bold text-gray-700">{{ format(cartStore.cartTotal) }} сум</span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>{{ $t('cart.delivery') }}</span>
                <span class="text-green-600 font-bold uppercase tracking-widest text-[10px]">{{ $t('cart.free') }}</span>
              </div>
              <div class="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span class="text-base font-bold text-brand-dark-blue">{{ $t('cart.total') }}:</span>
                <div class="text-2xl font-black text-brand-blue">{{ format(cartStore.cartTotal) }} <span class="text-sm">сум</span></div>
              </div>
            </div>

            <NuxtLink :to="localePath('/checkout')" class="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue text-white font-bold text-lg shadow-xl shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue active:scale-95">
              {{ $t('cart.checkout') }}
              <Icon name="ph:arrow-right-bold" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200 shadow-inner">
        <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="ph:shopping-cart-thin" size="56" class="text-gray-300" />
        </div>
        <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('cart.empty_title') }}</h2>
        <NuxtLink :to="localePath('/catalog')" class="mt-8 inline-flex h-12 items-center px-8 rounded-xl bg-brand-blue text-white font-black uppercase tracking-widest text-xs hover:bg-brand-dark-blue transition-all">
          {{ $t('cart.go_to_catalog') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const cartStore = useCartStore();
const { format } = useCurrency();
const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `${t('cart.title')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>