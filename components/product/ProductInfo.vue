<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100 border border-gray-100 relative overflow-hidden">

      <!-- Декор фона -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <!-- 1. Хедер: Метки и Коды -->
      <div class="mb-6 relative z-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Метка Новинка -->
            <span v-if="product.isNew" class="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
              {{ $t('product.new') }}
            </span>

            <!-- Артикул (product_code) -->
            <button
                @click="copyToClipboard(product.product_code, 'sku')"
                v-if="product.product_code"
                class="group px-2.5 py-1 rounded-lg bg-brand-blue/5 text-brand-blue text-[10px] font-bold uppercase tracking-wider border border-brand-blue/10 flex items-center gap-1.5 transition-colors hover:bg-brand-blue hover:text-white"
            >
              <span>{{ $t('product.sku') }}: {{ product.product_code }}</span>
              <Icon name="ph:copy-simple" class="opacity-50 group-hover:opacity-100" />
            </button>

            <!-- Код упаковки (packing_code) -->
            <div
                v-if="product.packing_code"
                class="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-gray-100"
            >
              ID: {{ product.packing_code }}
            </div>
          </div>

          <!-- Рейтинг -->
          <div class="flex items-center gap-1 text-orange-400 bg-orange-50 px-2.5 py-1 rounded-xl">
            <Icon name="ph:star-fill" size="14" />
            <span class="text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
            <span class="text-[10px] text-gray-400 font-bold ml-1">({{ product.reviews_count || 0 }})</span>
          </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-extrabold text-brand-dark-blue leading-tight mb-3">
          {{ product.name }}
        </h1>

        <!-- Бренд -->
        <NuxtLink v-if="product.brand" :to="localePath('/catalog')" class="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline group">
          <Icon name="ph:seal-check-fill" size="16" />
          {{ product.brand.name }}
          <Icon name="ph:caret-right-bold" size="12" class="transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>

      <!-- 2. Цена и Наличие -->
      <div class="mb-6 bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
        <div class="flex flex-col gap-3">
          <div>
            <span v-if="product.oldPrice && product.oldPrice > product.price" class="block text-sm font-bold text-gray-400 line-through mb-1">
              {{ format(product.oldPrice) }} сум
            </span>
            <div class="flex items-baseline gap-1.5">
              <span class="font-unbounded text-3xl font-black text-brand-blue">{{ format(product.price) }}</span>
              <span class="text-sm font-bold text-gray-500 uppercase">{{ $t('common.currency') }}</span>
            </div>
          </div>

          <div class="h-px bg-gray-200/50 w-full"></div>

          <!-- Статус наличия -->
          <div>
             <span v-if="isAvailable" class="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full">
               <Icon name="ph:check-circle-fill" size="14" />
               {{ $t('product.stock_count', { n: product.stock }) }}
             </span>
            <span v-else class="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
               <Icon name="ph:clock-fill" size="14" />
               {{ $t('product.expected') }}
             </span>
          </div>
        </div>
      </div>

      <!-- 3. Кнопки действий -->
      <div class="space-y-3">
        <!-- Если товар в корзине — показываем счетчик -->
        <div v-if="isInCart" class="flex h-14 w-full items-center justify-between rounded-2xl bg-brand-blue px-2 text-white shadow-xl shadow-brand-blue/20">
          <button @click="updateQty(-1)" class="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors active:scale-90">
            <Icon name="ph:minus-bold" />
          </button>
          <span class="text-xl font-black tabular-nums">{{ cartItemQty }}</span>
          <button
              @click="updateQty(1)"
              class="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors active:scale-90 disabled:opacity-30"
              :disabled="cartItemQty >= (product.stock || 0)"
          >
            <Icon name="ph:plus-bold" />
          </button>
          <NuxtLink :to="localePath('/cart')" class="ml-2 px-4 h-11 flex items-center justify-center bg-brand-dark-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
            {{ $t('cart.checkout') }}
          </NuxtLink>
        </div>

        <!-- Если не в корзине — кнопка добавить -->
        <button
            v-else
            @click="addToCart"
            :disabled="!isAvailable"
            class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:bg-gray-200"
        >
          <Icon :name="isAvailable ? 'ph:shopping-cart-simple-fill' : 'ph:clock-fill'" size="22" />
          <span class="font-black text-sm uppercase tracking-widest">
            {{ isAvailable ? $t('product.add_to_cart') : $t('product.expected') }}
          </span>
        </button>

        <!-- Второстепенные кнопки -->
        <div class="grid grid-cols-2 gap-3">
          <button
              @click="wishlistStore.toggleWishlist(product)"
              class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-red hover:text-brand-red transition-all bg-white active:scale-95"
          >
            <Icon :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" :class="{'text-brand-red animate-heart-pop': isLiked}" />
            <span class="text-[11px] uppercase tracking-wider">{{ isLiked ? $t('profile.wishlist') : $t('common.to_wishlist') }}</span>
          </button>

          <button
              @click="shareProduct"
              class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-all bg-white active:scale-95"
          >
            <Icon name="ph:share-network-bold" size="20" />
            <span class="text-[11px] uppercase tracking-wider">{{ $t('common.share') }}</span>
          </button>
        </div>
      </div>

      <!-- 4. Инфо-блоки -->
      <div class="mt-8 pt-6 border-t border-gray-100 space-y-5">
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0 shadow-sm">
            <Icon name="ph:truck-fill" size="20" />
          </div>
          <div>
            <p class="text-[11px] font-black text-brand-dark-blue uppercase tracking-wider">{{ $t('product.fast_delivery') }}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ $t('product.fast_delivery_desc') }}</p>
          </div>
        </div>
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0 shadow-sm">
            <Icon name="ph:shield-check-fill" size="20" />
          </div>
          <div>
            <p class="text-[11px] font-black text-brand-dark-blue uppercase tracking-wider">{{ $t('product.quality_warranty') }}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ $t('product.quality_warranty_desc') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '~/types';

const props = defineProps({
  product: { type: Object as PropType<Product>, required: true }
});

const { format } = useCurrency();
const { t } = useI18n();
const localePath = useLocalePath();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { showToast } = useToast();
const { startAnimation } = useCartAnimation();

// Состояние корзины
const cartItem = computed(() => cartStore.cart.find(i => String(i.id || i.product_id) === String(props.product.id || props.product.product_id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);

// Состояние избранного и наличия
const isLiked = computed(() => wishlistStore.isInWishlist(String(props.product.id || props.product.product_id)));
const isAvailable = computed(() => (props.product.stock || 0) > 0);

// Функции
const copyToClipboard = async (text: string, type: string) => {
  if (process.client && text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t(type === 'sku' ? 'product.id_copied' : 'common.save_success'), 'success');
    } catch (e) { console.error(e); }
  }
};

const shareProduct = async () => {
  if (process.client) {
    try {
      if (navigator.share) {
        await navigator.share({ title: props.product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast(t('product.link_copied'), 'success');
      }
    } catch (e) { console.error(e); }
  }
};

const addToCart = (event: MouseEvent) => {
  if (!isAvailable.value) return;
  cartStore.addToCart(props.product);
  showToast(t('product.add_to_cart'));

  const imgUrl = props.product.image || (Array.isArray(props.product.images) ? props.product.images[0] : '');
  if (imgUrl) startAnimation(event, imgUrl);
};

const updateQty = (delta: number) => {
  const newQty = cartItemQty.value + delta;
  const pId = String(props.product.id || props.product.product_id);
  const maxStock = props.product.stock || 999;

  if (newQty > maxStock) {
    showToast(`${t('common.all')}: ${maxStock}`, 'warning');
    return;
  }
  if (newQty <= 0) {
    cartStore.removeFromCart(pId);
  } else {
    cartStore.updateQuantity(pId, newQty);
  }
};
</script>

<style scoped>
@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.animate-heart-pop {
  animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>