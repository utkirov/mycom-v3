<template>
  <div class="flex flex-col gap-6">
    <div class="rounded-3xl bg-white p-6 shadow-lg shadow-gray-100 border border-gray-100 relative overflow-hidden">

      <!-- Декор фона -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <!-- 1. ЗАГОЛОВОК И БРЕНД -->
      <div class="mb-6 relative z-10">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <span v-if="product.isNew" class="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
              {{ $t('product.new') }}
            </span>

            <!-- ID ТОВАРА (Кликабельный) -->
            <button
                @click="copyId"
                class="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 hover:text-brand-dark-blue transition-colors active:scale-95 flex items-center gap-1"
                :title="$t('product.copy_id')"
            >
              ID: {{ product.id }}
              <Icon name="ph:copy-simple" size="10" />
            </button>
          </div>

          <!-- Рейтинг -->
          <div class="flex items-center gap-1 text-orange-400 bg-orange-50 px-2 py-1 rounded-lg">
            <Icon name="ph:star-fill" size="16" />
            <span class="text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
            <span class="text-[10px] text-gray-400 font-bold ml-1">({{ product.reviewsCount }} отзывов)</span>
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

      <!-- 2. ЦЕНА -->
      <div class="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div class="flex flex-col justify-between items-start gap-y-2">
          <div>
            <span v-if="product.oldPrice" class="block text-sm font-bold text-gray-400 line-through mb-1">
              {{ format(product.oldPrice) }}
            </span>
            <div class="flex items-baseline gap-1">
              <span class="font-unbounded text-3xl font-black text-brand-blue">{{ format(product.price) }}</span>
              <span class="text-sm font-bold text-gray-500">сум</span>
            </div>
          </div>

          <!-- Индикатор наличия -->
          <div class="text-right">
             <span v-if="product.stock > 0" class="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
               <Icon name="ph:check-circle-fill" />
               {{ $t('product.stock_count', {n: product.stock}) }}
             </span>
            <span v-else class="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
               <Icon name="ph:x-circle-fill" />
               {{ $t('product.no_stock') }}
             </span>
          </div>
        </div>
      </div>

      <!-- 3. ГЛАВНЫЕ ХАРАКТЕРИСТИКИ -->
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


      <!-- 5. ДЕЙСТВИЯ -->
      <div class="space-y-3">
        <!-- Кнопка корзины / счетчик -->
        <div v-if="isInCart" class="flex h-14 w-full items-center justify-between rounded-2xl bg-brand-blue px-2 text-white shadow-xl">
          <button @click="updateQty(-1)" class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <Icon name="ph:minus-bold" />
          </button>
          <span class="text-lg font-black">{{ cartItemQty }}</span>
          <button @click="updateQty(1)" class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-colors" :disabled="cartItemQty >= product.stock">
            <Icon name="ph:plus-bold" />
          </button>
          <NuxtLink :to="localePath('/cart')" class="ml-2 px-4 h-10 flex items-center justify-center bg-brand-dark-blue rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-dark-blue transition-colors">
            {{ $t('cart.checkout') }}
          </NuxtLink>
        </div>

        <button
            v-else
            @click="addToCart"
            :disabled="product.stock === 0"
            class="group relative flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div class="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
          <Icon name="ph:shopping-cart-simple-fill" size="24" />
          <span class="font-black text-sm uppercase tracking-widest">{{ product.stock === 0 ? $t('product.expected') : $t('product.add_to_cart') }}</span>
        </button>

        <!-- Вторичные кнопки -->
        <div class="grid grid-cols-2 gap-3">
          <button @click="wishlistStore.toggleWishlist(product)" class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors bg-white">
            <Icon :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" :class="{'text-brand-red': isLiked}" />
            <span class="text-xs">{{ isLiked ? $t('profile.wishlist') : $t('common.to_wishlist') }}</span>
          </button>

          <!-- КНОПКА ПОДЕЛИТЬСЯ -->
          <button
              @click="shareLink"
              class="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors bg-white active:scale-95"
          >
            <Icon name="ph:share-network-bold" size="20" />
            <span class="text-xs">{{ $t('common.share') }}</span>
          </button>
        </div>
      </div>

      <!-- 6. ДОСТАВКА (Инфо) -->
      <div class="mt-6 pt-6 border-t border-gray-100 space-y-4">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
            <Icon name="ph:truck-fill" size="20" />
          </div>
          <div>
            <p class="text-xs font-bold text-brand-dark-blue uppercase">Доставка завтра</p>
            <p class="text-xs text-gray-500 mt-0.5">Бесплатно по Ташкенту от 1 млн сум</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <Icon name="ph:shield-check-fill" size="20" />
          </div>
          <div>
            <p class="text-xs font-bold text-brand-dark-blue uppercase">{{ $t('product.quality_warranty') }}</p>
            <p class="text-xs text-gray-500 mt-0.5">1 год официальной гарантии</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({ product: { type: Object, required: true } });

const { format } = useCurrency();
const { t } = useI18n();
const localePath = useLocalePath();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { showToast } = useToast();
const { startAnimation } = useCartAnimation();

const cartItem = computed(() => cartStore.cart.find(i => String(i.id) === String(props.product.id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);
const isLiked = computed(() => wishlistStore.isInWishlist(props.product.id));

// --- ЛОГИКА КОПИРОВАНИЯ И ШЭРИНГА ---

// 1. Копировать ID
const copyId = async () => {
  if (process.client) {
    try {
      await navigator.clipboard.writeText(String(props.product.id));
      showToast(t('product.id_copied'), 'success');
    } catch (e) {
      console.error(e);
    }
  }
};

// 2. Поделиться ссылкой
const shareLink = async () => {
  if (process.client) {
    try {
      // Пытаемся использовать нативный диалог "Поделиться" (на мобилках)
      if (navigator.share) {
        await navigator.share({
          title: props.product.name,
          url: window.location.href
        });
      } else {
        // Иначе просто копируем ссылку
        await navigator.clipboard.writeText(window.location.href);
        showToast(t('product.link_copied'), 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }
};

// -------------------------------------

const keySpecs = computed(() => {
  if (!props.product.specifications) return [];
  return props.product.specifications.slice(0, 4);
});

const getSpecIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('проц') || n.includes('cpu')) return 'ph:cpu-bold';
  if (n.includes('память') || n.includes('ram')) return 'ph:memory-bold';
  if (n.includes('экран') || n.includes('display')) return 'ph:monitor-bold';
  if (n.includes('накопитель') || n.includes('ssd') || n.includes('hdd')) return 'ph:hard-drives-bold';
  if (n.includes('видео') || n.includes('gpu')) return 'ph:graphics-card-bold';
  if (n.includes('батарея')) return 'ph:battery-high-bold';
  return 'ph:sliders-horizontal-bold';
};

const calculateInstallment = (price: number) => {
  return format(Math.round((price * 1.3) / 12));
};

const addToCart = (event: MouseEvent) => {
  cartStore.addToCart(props.product);
  showToast(t('product.add_to_cart'));
  startAnimation(event, props.product.images?.[0] || props.product.image);
};

const updateQty = (delta: number) => {
  const newQty = cartItemQty.value + delta;
  if (newQty > props.product.stock) return;
  if (newQty <= 0) cartStore.removeFromCart(props.product.id);
  else cartStore.updateQuantity(props.product.id, newQty);
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