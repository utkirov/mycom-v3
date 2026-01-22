<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100 border border-gray-100 relative overflow-hidden">

      <!-- Decor -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <!-- 1. Header & Brand -->
      <div class="mb-6 relative z-10">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span v-if="product.isNew" class="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
              {{ $t('product.new') }}
            </span>

            <button
                @click="copyId"
                class="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 hover:text-brand-dark-blue transition-colors active:scale-95 flex items-center gap-1"
                :title="$t('product.copy_id')"
            >
              ID: {{ product.product_id || product.id }}
              <Icon name="ph:copy-simple" size="10" />
            </button>
          </div>

          <div class="flex items-center gap-1 text-orange-400 bg-orange-50 px-2 py-1 rounded-lg">
            <Icon name="ph:star-fill" size="16" />
            <span class="text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
            <span class="text-[10px] text-gray-400 font-bold ml-1">({{ product.reviews_count || 0 }})</span>
          </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-extrabold text-brand-dark-blue leading-tight mb-2">
          {{ product.name }}
        </h1>

        <NuxtLink v-if="product.brand" :to="localePath('/catalog')" class="text-sm font-bold text-brand-blue hover:underline flex items-center gap-1">
          {{ product.brand.name }}
          <Icon name="ph:caret-right-bold" size="12" />
        </NuxtLink>
      </div>

      <!-- 2. Price & Stock -->
      <div class="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div class="flex flex-col justify-between items-start gap-y-2">
          <div>
            <span v-if="product.oldPrice && product.oldPrice > product.price" class="block text-sm font-bold text-gray-400 line-through mb-1">
              {{ format(product.oldPrice) }}
            </span>
            <div class="flex items-baseline gap-1">
              <span class="font-unbounded text-3xl font-black text-brand-blue">{{ format(product.price) }}</span>
              <span class="text-sm font-bold text-gray-500">{{ $t('common.currency') }}</span>
            </div>
          </div>

          <!-- Stock Status -->
          <div class="text-right">
             <span v-if="isAvailable" class="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
               <Icon name="ph:check-circle-fill" />
               {{ $t('product.stock_count', { n: product.stock }) }}
             </span>
            <span v-else class="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
               <Icon name="ph:x-circle-fill" />
               {{ $t('product.no_stock') }}
             </span>
          </div>
        </div>
      </div>

      <!-- 3. Specs Preview -->
      <div v-if="keySpecs.length" class="mb-6 grid md:grid-cols-2 gap-2">
        <div v-for="(spec, idx) in keySpecs" :key="idx" class="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
            <Icon :name="getSpecIcon(spec.name)" size="18" />
          </div>
          <div class="overflow-hidden">
            <p class="text-[10px] font-bold text-gray-400 uppercase truncate">{{ spec.name }}</p>
            <p class="text-xs font-bold text-brand-dark-blue truncate" :title="spec.value">{{ spec.value }}</p>
          </div>
        </div>
      </div>

      <!-- 4. Actions -->
      <div class="space-y-3">
        <!-- Add to Cart / Counter -->
        <div v-if="isInCart" class="flex h-14 w-full items-center justify-between rounded-2xl bg-brand-blue px-2 text-white shadow-xl">
          <button @click="updateQty(-1)" class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <Icon name="ph:minus-bold" />
          </button>
          <span class="text-lg font-black">{{ cartItemQty }}</span>
          <button @click="updateQty(1)" class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors" :disabled="cartItemQty >= (product.stock || 0)">
            <Icon name="ph:plus-bold" />
          </button>
          <NuxtLink :to="localePath('/cart')" class="ml-2 px-4 h-10 flex items-center justify-center bg-brand-dark-blue rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark-blue transition-colors">
            {{ $t('cart.checkout') }}
          </NuxtLink>
        </div>

        <button
            v-else
            @click="addToCart"
            :disabled="!isAvailable"
            class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:bg-gray-300"
        >
          <div v-if="isAvailable" class="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
          <Icon :name="isAvailable ? 'ph:shopping-cart-simple-fill' : 'ph:clock-fill'" size="24" />
          <span class="font-black text-sm uppercase tracking-widest">{{ isAvailable ? $t('product.add_to_cart') : $t('product.expected') }}</span>
        </button>

        <!-- Secondary Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button @click="wishlistStore.toggleWishlist(product)" class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors bg-white active:scale-95">
            <Icon :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" :class="{'text-brand-red': isLiked}" />
            <span class="text-xs">{{ isLiked ? $t('profile.wishlist') : $t('common.to_wishlist') }}</span>
          </button>

          <button
              @click="shareLink"
              class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors bg-white active:scale-95"
          >
            <Icon name="ph:share-network-bold" size="20" />
            <span class="text-xs">{{ $t('common.share') }}</span>
          </button>
        </div>
      </div>

      <!-- 5. Delivery Info -->
      <div class="mt-6 pt-6 border-t border-gray-100 space-y-4">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
            <Icon name="ph:truck-fill" size="20" />
          </div>
          <div>
            <p class="text-xs font-bold text-brand-dark-blue uppercase">{{ $t('product.fast_delivery') }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ $t('product.fast_delivery_desc') }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <Icon name="ph:shield-check-fill" size="20" />
          </div>
          <div>
            <p class="text-xs font-bold text-brand-dark-blue uppercase">{{ $t('product.quality_warranty') }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ $t('product.quality_warranty_desc') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
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

const cartItem = computed(() => cartStore.cart.find(i => String(i.id || i.product_id) === String(props.product.id || props.product.product_id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);
const isLiked = computed(() => wishlistStore.isInWishlist(String(props.product.id || props.product.product_id)));
const isAvailable = computed(() => (props.product.stock || 0) > 0);

// --- Copy & Share ---
const copyId = async () => {
  if (process.client) {
    try {
      await navigator.clipboard.writeText(String(props.product.id || props.product.product_id));
      showToast(t('product.id_copied'), 'success');
    } catch (e) { console.error(e); }
  }
};

const shareLink = async () => {
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

// --- Specs Helper ---
const keySpecs = computed(() => props.product.specifications?.slice(0, 4) || []);

const getSpecIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('cpu') || n.includes('процессор') || n.includes('проц')) return 'ph:cpu-bold';
  if (n.includes('ram') || n.includes('память') || n.includes('memory')) return 'ph:memory-bold';
  if (n.includes('display') || n.includes('экран') || n.includes('монитор')) return 'ph:monitor-bold';
  if (n.includes('ssd') || n.includes('hdd') || n.includes('disk') || n.includes('накопитель')) return 'ph:hard-drives-bold';
  if (n.includes('gpu') || n.includes('video') || n.includes('видео')) return 'ph:graphics-card-bold';
  if (n.includes('battery') || n.includes('батарея')) return 'ph:battery-high-bold';
  return 'ph:sliders-horizontal-bold';
};

// --- Actions ---
const addToCart = (event: MouseEvent) => {
  if (!isAvailable.value) {
    showToast(t('product.no_stock'), 'error');
    return;
  }
  cartStore.addToCart(props.product);
  showToast(t('product.add_to_cart'));

  // Анимация полета
  const imgUrl = typeof props.product.image === 'string' ? props.product.image
      : (Array.isArray(props.product.images) && props.product.images.length > 0)
          ? (typeof props.product.images[0] === 'string' ? props.product.images[0] : props.product.images[0].url)
          : '';

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
@keyframes shine {
  100% { transform: translateX(200%) skewX(12deg); }
}
.group:hover .animate-shine {
  animation: shine 1.5s infinite linear;
}
</style>