<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <div class="flex h-14 items-center gap-4 rounded-xl bg-gray-100 px-4 ring-1 ring-gray-200 transition-all focus-within:ring-brand-blue/30">
        <button @click="qty > 1 && qty--" class="text-gray-400 hover:text-brand-blue transition-colors">
          <Icon name="ph:minus-bold" size="18" />
        </button>
        <input
            v-model.number="qty"
            type="number"
            class="w-10 bg-transparent text-center font-black text-brand-dark-blue outline-none"
            readonly
        >
        <button @click="qty++" class="text-gray-400 hover:text-brand-blue transition-colors">
          <Icon name="ph:plus-bold" size="18" />
        </button>
      </div>

      <button
          @click="addToCart"
          class="flex h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-brand-blue font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-dark-blue active:scale-95"
      >
        <Icon name="ph:shopping-cart-simple-fill" size="24" />
        <span>{{ $t('product.add_to_cart') }}</span>
      </button>
    </div>

    <button
        @click="buyNow"
        class="flex h-14 w-full items-center justify-center rounded-xl border-2 border-brand-blue text-brand-blue font-bold transition hover:bg-brand-blue/5 active:scale-95"
    >
      {{ $t('product.buy_now') }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true }
});

const qty = ref(1);
const cartStore = useCartStore();
const { showToast } = useToast();
const { t } = useI18n();

const addToCart = () => {
  cartStore.addToCart(props.product, qty.value);
  showToast(t('product.add_to_cart'));
};

const buyNow = () => {
  showToast('Feature coming soon', 'info');
};
</script>