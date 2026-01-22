<template>
  <div class="fixed bottom-16 left-0 right-0 z-40 block border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden pb-safe">
    <div class="flex items-center gap-4">

      <!-- Цена (слева) -->
      <div class="flex flex-col">
        <span class="text-[10px] text-gray-400 line-through" v-if="product.oldPrice">{{ format(product.oldPrice) }}</span>
        <div class="flex items-baseline gap-1">
          <span class="font-unbounded text-lg font-bold text-brand-blue">{{ format(product.price) }}</span>
          <span class="text-xs text-gray-500">сум</span>
        </div>
      </div>

      <!-- Действия (справа) -->
      <div class="flex-1 flex justify-end">

        <!-- ОЖИДАЕМ -->
        <button
            v-if="(product.stock || 0) === 0"
            disabled
            class="flex w-full h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
        >
          <Icon name="ph:clock-fill" size="18" />
          {{ $t('product.expected') }}
        </button>

        <!-- СЧЕТЧИК (В корзине) -->
        <div v-else-if="isInCart" class="flex w-full h-11 items-center justify-between rounded-xl bg-gray-100 px-2">
          <button @click="updateQty(-1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-brand-blue active:scale-90 transition-transform">
            <Icon name="ph:minus-bold" />
          </button>
          <span class="font-black text-brand-dark-blue">{{ cartItemQty }}</span>
          <button @click="updateQty(1)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-brand-blue active:scale-90 transition-transform" :disabled="cartItemQty >= product.stock" :class="cartItemQty >= product.stock ? 'opacity-50' : ''">
            <Icon name="ph:plus-bold" />
          </button>
        </div>

        <!-- КНОПКА "В КОРЗИНУ" -->
        <button
            v-else
            @click="addToCart"
            class="flex w-full h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-brand-blue active:scale-95 transition-all shadow-lg shadow-brand-blue/30"
        >
          <Icon name="ph:shopping-cart-simple-fill" size="20" />
          {{ $t('product.add_to_cart') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ product: { type: Object, required: true } });

const { format } = useCurrency();
const { t } = useI18n();
const cartStore = useCartStore();
const { showToast } = useToast();

const cartItem = computed(() => cartStore.cart.find(i => String(i.id) === String(props.product.id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);

const addToCart = () => {
  cartStore.addToCart(props.product);
  showToast(t('product.add_to_cart'));
};

const updateQty = (delta) => {
  const newQty = cartItemQty.value + delta;
  if (newQty > props.product.stock) {
    showToast(`${t('common.all')}: ${props.product.stock}`, 'warning');
    return;
  }
  if (newQty <= 0) {
    cartStore.removeFromCart(props.product.id);
  } else {
    cartStore.updateQuantity(props.product.id, newQty);
  }
};
</script>

<style scoped>
.pb-safe { padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
</style>