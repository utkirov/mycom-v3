<template>
  <div class="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white p-3 transition-all duration-500 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/10">

    <!-- КЛИКАБЕЛЬНАЯ КАРТИНКА -->
    <NuxtLink
        :to="localePath('/product/' + getProductLink(product))"
        class="relative mb-4 block aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 p-4"
        :aria-label="product.name"
    >
      <NuxtImg
          :src="getImageUrl(product)"
          :alt="product.name"
          class="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
          width="300"
          height="300"
          format="webp"
          loading="lazy"
          fit="contain"
          background="transparent"
      />

      <!-- БЕЙДЖ СКИДКИ -->
      <div v-if="discountPercent > 0" class="absolute left-3 top-3 rounded-xl bg-brand-red px-2.5 py-1 text-[11px] font-black text-white shadow-lg">
        -{{ discountPercent }}%
      </div>

      <!-- КНОПКА ИЗБРАННОГО -->
      <button
          @click.stop.prevent="onToggleWishlist"
          class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-md shadow-sm transition-all hover:bg-white active:scale-90"
          :class="{ 'text-brand-red': isFavorite, 'text-gray-400': !isFavorite }"
          :aria-label="$t('profile.wishlist')"
      >
        <Icon :name="isFavorite ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" />
      </button>
    </NuxtLink>

    <!-- ИНФОРМАЦИЯ -->
    <div class="flex flex-1 flex-col px-1">
      <NuxtLink :to="localePath('/product/' + getProductLink(product))" class="mb-3 block">
        <h3 class="h-10 text-xs font-bold leading-tight text-brand-dark-blue line-clamp-2 md:text-sm transition-colors group-hover:text-brand-blue">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="mt-auto space-y-4 pt-2">
        <div class="flex flex-col">
          <span v-if="product.discount_price" class="text-[11px] font-bold text-gray-500 line-through decoration-brand-red/30">
            {{ formatPrice(product.price) }} сум
          </span>
          <div class="flex items-baseline gap-1 text-brand-blue font-black">
            <span class="text-xl md:text-2xl tracking-tighter">{{ formatPrice(displayPrice) }}</span>
            <span class="text-[10px] uppercase opacity-70">сум</span>
          </div>
        </div>

        <!-- КНОПКИ ДЕЙСТВИЯ -->
        <div class="flex items-center gap-2">
          <div class="flex-1">

            <!-- ЕСЛИ НЕТ В НАЛИЧИИ -->
            <button
                v-if="(product.stock || 0) === 0"
                disabled
                class="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed border border-gray-200"
            >
              <Icon name="ph:clock-fill" size="18" />
              <span>{{ $t('product.expected') }}</span>
            </button>

            <!-- ДОБАВИТЬ В КОРЗИНУ -->
            <button
                v-else-if="!isInCart"
                @click.stop.prevent="onAddToCart"
                class="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20 transition-all hover:bg-brand-dark-blue active:scale-95"
                :aria-label="$t('product.add_to_cart')"
            >
              <Icon name="ph:shopping-cart-simple-bold" size="18" />
              <span>{{ $t('product.add_to_cart') }}</span>
            </button>

            <!-- СЧЕТЧИК -->
            <div v-else class="flex h-11 w-full items-center justify-between rounded-2xl bg-gray-100 px-2 ring-1 ring-brand-blue/20">
              <button
                  @click.stop.prevent="onUpdateQty(-1)"
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90 hover:bg-brand-blue hover:text-white"
                  :aria-label="$t('cart.delete')"
              >
                <Icon name="ph:minus-bold" size="16" />
              </button>

              <span class="text-sm font-black text-brand-dark-blue tabular-nums">
                {{ cartItemQty }}
              </span>

              <button
                  @click.stop.prevent="onUpdateQty(1)"
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90 hover:bg-brand-blue hover:text-white"
                  :aria-label="$t('common.add')"
              >
                <Icon name="ph:plus-bold" size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  product: { type: Object, required: true }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { showToast } = useToast();
const { t } = useI18n();
const localePath = useLocalePath();
const { startAnimation } = useCartAnimation();

const displayPrice = computed(() => props.product.discount_price || props.product.price);
const discountPercent = computed(() => {
  if (!props.product.discount_price) return 0;
  return Math.round(100 - (props.product.discount_price / props.product.price) * 100);
});

const formatPrice = (p: number) => String(p || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Хелпер для получения картинки
const getImageUrl = (p: any) => p.image || (p.images && p.images[0] ? (p.images[0].url || p.images[0]) : '/images/pc-placeholder.png');

// --- ГЕНЕРАЦИЯ ССЫЛКИ (SLUG) ---
const getProductLink = (p: any) => {
  // 1. Если slug уже передан (мы его сформировали в родителе), используем его
  if (p.slug) return p.slug;

  const id = p.id || p.product_id;

  // 2. Если есть seo.slug, формируем гибрид name-id
  if (p.slug) {
    return `${p.seo.slug}-${id}`;
  }

  // 3. Fallback на ID
  return id;
};

// Проверка наличия в корзине
const cartItem = computed(() => cartStore.cart?.find(i => String(i.id || i.product_id) === String(props.product.product_id || props.product.id)));
const isInCart = computed(() => !!cartItem.value);
const cartItemQty = computed(() => cartItem.value?.quantity || 0);

const isFavorite = computed(() => wishlistStore.isInWishlist(String(props.product.product_id || props.product.id)));

const onAddToCart = (event: MouseEvent) => {
  const stock = props.product.stock !== undefined ? props.product.stock : 10;
  if (stock > 0) {
    cartStore.addToCart({ ...props.product, id: props.product.product_id });
    showToast(t('product.add_to_cart'));
    // Запускаем анимацию полета
    startAnimation(event, getImageUrl(props.product));
  } else {
    showToast(t('product.expected'), 'info');
  }
};

const onUpdateQty = (delta: number) => {
  const newQty = cartItemQty.value + delta;
  const pId = String(props.product.product_id || props.product.id);
  const stock = props.product.stock !== undefined ? props.product.stock : 999;

  if (newQty > stock) {
    showToast(`${t('common.all')}: ${stock}`, 'warning');
    return;
  }

  if (newQty <= 0) {
    cartStore.removeFromCart(pId);
  } else {
    cartStore.updateQuantity(pId, newQty);
  }
};

const onToggleWishlist = () => {
  wishlistStore.toggleWishlist(props.product);
};
</script>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>