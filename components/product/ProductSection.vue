<template>
  <div v-if="product" class="flex flex-col gap-y-5">
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="inline-block rounded-md bg-brand-dark-blue px-3 py-1 text-sm font-semibold text-white">
        {{ $t('product.installment_sub') }}
      </div>

      <div class="mt-3 text-center">
        <p class="font-unbounded text-4xl font-bold text-brand-blue">{{ format(product.price) }} сум</p>
        <span v-if="isDiscounted" class="text-lg text-brand-gray line-through">
          {{ format(product.oldPrice) }} сум
        </span>
      </div>

      <div class="mt-4 flex flex-col gap-y-3">
        <button
            @click="handleAddToCart"
            :disabled="product.stock === 0"
            class="flex h-12 w-full items-center justify-center gap-x-2 rounded-lg bg-brand-blue text-base font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="ph:shopping-cart-simple" size="20"/>
          <span>{{ product.stock === 0 ? $t('product.no_stock') : $t('product.add_to_cart') }}</span>
        </button>
        <button
            class="flex h-12 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-base font-semibold text-gray-700 transition hover:bg-200">
          {{ $t('product.buy_one_click') }}
        </button>
      </div>

      <div v-if="product.stock > 0" class="mt-4 flex items-center justify-center gap-x-2">
        <Icon name="ph:check-circle-fill" size="20" class="text-green-500"/>
        <span class="font-semibold text-gray-700">{{ $t('product.stock_count', { n: product.stock }) }}</span>
      </div>
      <div v-else class="mt-4 flex items-center justify-center gap-x-2">
        <Icon name="ph:x-circle-fill" size="20" class="text-red-500"/>
        <span class="font-semibold text-gray-700">{{ $t('product.no_stock') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, default: null }
});

const cartStore = useCartStore();
const { format } = useCurrency();
const { showToast } = useToast();
const { t } = useI18n(); // Переход на useI18n

const isDiscounted = computed(() => {
  return props.product && props.product.oldPrice && props.product.oldPrice > props.product.price;
});

const handleAddToCart = () => {
  if (!props.product) return;
  if (props.product.stock === 0) {
    showToast(t('product.no_stock'), 'error');
    return;
  }
  cartStore.addToCart(props.product);
  showToast(t('product.add_to_cart'));
};
</script>