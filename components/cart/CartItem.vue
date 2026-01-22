<template>
  <div class="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm border border-transparent transition-all hover:border-brand-blue/20 sm:flex-row sm:items-center">

    <div class="flex items-start gap-4">
      <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
        <img
            :src="item.image || '/images/pc-placeholder.png'"
            :alt="item.name"
            class="h-full w-full object-contain mix-blend-multiply"
        />
        <span v-if="stockLimit && stockLimit < 5" class="absolute bottom-1 left-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
          {{ $t('product.stock', { n: stockLimit }) }}
        </span>
      </NuxtLink>
    </div>

    <div class="flex flex-grow flex-col justify-between gap-y-2 sm:gap-y-1">
      <div class="flex justify-between items-start gap-2">
        <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="text-sm font-bold text-brand-dark-blue line-clamp-2 hover:text-brand-blue sm:text-base">
          {{ item.name }}
        </NuxtLink>

        <button @click="handleRemove" class="sm:hidden text-gray-400 hover:text-red-500">
          <Icon name="ph:trash-fill" size="20" />
        </button>
      </div>

      <p class="text-xs text-gray-500 line-clamp-1">
        {{ $t('product.sku') }}: {{ item.product_id || item.id }}
      </p>

      <div class="mt-2 flex flex-wrap items-end justify-between gap-4 sm:mt-0">
        <!-- Счетчик -->
        <div class="flex items-center gap-x-3 rounded-lg bg-gray-50 p-1">
          <button
              @click="decrement"
              :disabled="item.quantity <= 1"
              class="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <Icon name="ph:minus-bold" size="14" />
          </button>

          <span class="w-6 text-center text-sm font-bold text-gray-900 tabular-nums">{{ item.quantity }}</span>

          <!-- UX FIX: Визуальная блокировка, если достигнут лимит -->
          <button
              @click="increment"
              :disabled="isMaxStock"
              class="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm text-gray-600 transition-all active:scale-90"
              :class="isMaxStock ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'hover:text-brand-blue'"
          >
            <Icon name="ph:plus-bold" size="14" />
          </button>
        </div>

        <div class="text-right">
          <div v-if="item.oldPrice && item.oldPrice > item.price" class="text-xs text-gray-400 line-through decoration-red-400">
            {{ format(item.oldPrice * item.quantity) }}
          </div>
          <div class="font-unbounded text-lg font-bold text-brand-blue">
            {{ format(item.price * item.quantity) }} <span class="text-xs font-normal text-gray-500">сум</span>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden flex-col items-end gap-2 sm:flex sm:w-32">
      <button @click="handleRemove" class="group flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
        <span>{{ $t('cart.delete') }}</span>
        <Icon name="ph:trash-fill" size="18" class="group-hover:scale-110 transition-transform"/>
      </button>

      <button @click="handleWishlist" class="group flex items-center gap-2 text-sm text-gray-400 hover:text-brand-blue transition-colors">
        <span class="text-xs">{{ isLiked ? $t('profile.wishlist') : $t('common.to_wishlist') }}</span>
        <Icon
            :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'"
            size="18"
            :class="isLiked ? 'text-brand-red' : 'group-hover:scale-110 transition-transform'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { CartItem } from '~/types';

const props = defineProps({
  item: { type: Object as PropType<CartItem>, required: true }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { format } = useCurrency();
const { showToast } = useToast();
const { t } = useI18n();
const localePath = useLocalePath();

const isLiked = computed(() => wishlistStore.isInWishlist(String(props.item.id || props.item.product_id)));

// Определяем лимит стока (приоритет stock, потом count)
const stockLimit = computed(() => {
  if (props.item.stock !== undefined) return props.item.stock;
  if (props.item.count !== undefined) return props.item.count;
  return 999;
});

const isMaxStock = computed(() => props.item.quantity >= stockLimit.value);

const increment = () => {
  if (isMaxStock.value) {
    showToast(`${t('common.all')}: ${stockLimit.value}`, 'warning');
    return;
  }
  // Используем ID или product_id
  cartStore.updateQuantity(String(props.item.id || props.item.product_id), props.item.quantity + 1);
};

const decrement = () => {
  const pId = String(props.item.id || props.item.product_id);
  if (props.item.quantity > 1) {
    cartStore.updateQuantity(pId, props.item.quantity - 1);
  } else {
    cartStore.removeFromCart(pId);
  }
};

const handleRemove = () => {
  cartStore.removeFromCart(String(props.item.id || props.item.product_id));
};

const handleWishlist = () => {
  wishlistStore.toggleWishlist(props.item);
};
</script>