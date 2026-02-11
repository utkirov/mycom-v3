<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100 border border-gray-100 relative overflow-hidden">

      <div class="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <!-- 1. Header & Codes -->
      <div class="mb-6 relative z-10">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex flex-wrap items-center gap-2">
            <span v-if="product.isNew" class="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
              {{ $t('product.new') }}
            </span>
            <div v-if="product.product_code" class="px-2.5 py-1 rounded-lg bg-brand-blue/5 text-brand-blue text-[10px] font-bold uppercase tracking-wider border border-brand-blue/10">
              {{ $t('product.sku') }}: {{ product.product_code }}
            </div>
          </div>
          <div class="flex items-center gap-1 text-orange-400 bg-orange-50 px-2.5 py-1 rounded-xl">
            <Icon name="ph:star-fill" size="14" />
            <span class="text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
            <span class="text-[10px] text-gray-400 font-bold ml-1">({{ product.reviews_count || 0 }})</span>
          </div>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-brand-dark-blue leading-tight mb-3">
          {{ product.name }}
        </h1>
        <NuxtLink v-if="product.brand" :to="localePath('/catalog')" class="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline">
          <Icon name="ph:seal-check-fill" size="16" />
          {{ product.brand.name }}
        </NuxtLink>
      </div>

      <!-- 2. Price & Stock -->
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

      <!-- --- НОВЫЙ БЛОК: 4 ХАРАКТЕРИСТИКИ С ИКОНКАМИ --- -->
      <div v-if="keySpecs.length" class="mb-6 grid grid-cols-2 gap-3">
        <div v-for="(spec, idx) in keySpecs" :key="idx" class="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-blue shrink-0 shadow-sm">
            <Icon :name="getSpecIcon(spec.name)" size="18" />
          </div>
          <div class="overflow-hidden">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-tight truncate">{{ spec.name }}</p>
            <p class="text-xs font-bold text-brand-dark-blue truncate leading-tight">{{ spec.value }}</p>
          </div>
        </div>
      </div>

      <!-- 3. Actions -->
      <div class="space-y-3">
        <div v-if="isInCart" class="flex h-14 w-full items-center justify-between rounded-2xl bg-brand-blue px-2 text-white shadow-xl">
          <button @click="updateQty(-1)" class="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 active:scale-90 transition-all">
            <Icon name="ph:minus-bold" />
          </button>
          <span class="text-xl font-black tabular-nums">{{ cartItemQty }}</span>
          <button @click="updateQty(1)" class="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 active:scale-90" :disabled="cartItemQty >= (product.stock || 0)">
            <Icon name="ph:plus-bold" />
          </button>
          <NuxtLink :to="localePath('/cart')" class="ml-2 px-4 h-11 flex items-center justify-center bg-brand-dark-blue rounded-xl text-[10px] font-black uppercase tracking-widest">
            {{ $t('cart.checkout') }}
          </NuxtLink>
        </div>

        <button
            v-else
            @click="addToCart"
            :disabled="!isAvailable"
            class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue text-white shadow-xl transition-all hover:bg-brand-dark-blue active:scale-95 disabled:bg-gray-200"
        >
          <Icon :name="isAvailable ? 'ph:shopping-cart-simple-fill' : 'ph:clock-fill'" size="22" />
          <span class="font-black text-sm uppercase tracking-widest">{{ isAvailable ? $t('product.add_to_cart') : $t('product.expected') }}</span>
        </button>

        <div class="grid grid-cols-2 gap-3">
          <button @click="wishlistStore.toggleWishlist(product)" class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-red hover:text-brand-red transition-all bg-white active:scale-95">
            <Icon :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" :class="{'text-brand-red animate-heart-pop': isLiked}" />
            <span class="text-[10px] uppercase tracking-widest">{{ isLiked ? $t('profile.wishlist') : $t('common.to_wishlist') }}</span>
          </button>
          <button @click="shareProduct" class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-all bg-white active:scale-95">
            <Icon name="ph:share-network-bold" size="20" />
            <span class="text-[10px] uppercase tracking-widest">{{ $t('common.share') }}</span>
          </button>
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

// --- ЛОГИКА ХАРАКТЕРИСТИК С ИКОНКАМИ ---
const keySpecs = computed(() => props.product.specifications?.slice(0, 4) || []);

const getSpecIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('cpu') || n.includes('процессор')) return 'ph:cpu-bold';
  if (n.includes('ram') || n.includes('память') || n.includes('оператив')) return 'ph:memory-bold';
  if (n.includes('display') || n.includes('экран') || n.includes('монитор')) return 'ph:monitor-bold';
  if (n.includes('ssd') || n.includes('hdd') || n.includes('накопитель') || n.includes('диск')) return 'ph:hard-drives-bold';
  if (n.includes('видео') || n.includes('gpu') || n.includes('nvidia') || n.includes('amd')) return 'ph:graphics-card-bold';
  if (n.includes('аккумулятор') || n.includes('батарея') || n.includes('mah')) return 'ph:battery-high-bold';
  return 'ph:sliders-horizontal-bold'; // Дефолтная иконка
};

// ... (остальная логика: isInCart, isAvailable, addToCart, updateQty, shareProduct) ...
const cartItem = computed(() => cartStore.cart.find(i => String(i.id || i.product_id) === String(props.product.id || props.product.product_id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);
const isLiked = computed(() => wishlistStore.isInWishlist(String(props.product.id || props.product.product_id)));
const isAvailable = computed(() => (props.product.stock || 0) > 0);

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
  if (newQty > (props.product.stock || 999)) {
    showToast(`${t('common.all')}: ${props.product.stock}`, 'warning');
    return;
  }
  if (newQty <= 0) cartStore.removeFromCart(pId);
  else cartStore.updateQuantity(pId, newQty);
};

const shareProduct = async () => {
  if (process.client) {
    try {
      if (navigator.share) await navigator.share({ title: props.product.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast(t('product.link_copied'), 'success');
      }
    } catch (e) { console.error(e); }
  }
};
</script>

<style scoped>
@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.animate-heart-pop { animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>