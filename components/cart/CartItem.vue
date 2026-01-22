<template>
  <div class="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm border border-transparent transition-all hover:border-brand-blue/20 sm:flex-row sm:items-center">

    <div class="flex items-start gap-4">
      <!-- Ссылка -->
      <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
        <img
            :src="item.image || '/images/pc-placeholder.png'"
            :alt="item.name"
            class="h-full w-full object-contain mix-blend-multiply"
        />
        <span v-if="item.stock && item.stock < 5" class="absolute bottom-1 left-1 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
          {{ $t('product.stock', { n: item.stock }) }}
        </span>
      </NuxtLink>
    </div>

    <div class="flex flex-grow flex-col justify-between gap-y-2 sm:gap-y-1">
      <div class="flex justify-between items-start gap-2">
        <!-- Ссылка -->
        <NuxtLink :to="localePath('/product/' + (item.slug || item.id))" class="text-sm font-bold text-brand-dark-blue line-clamp-2 hover:text-brand-blue sm:text-base">
          {{ item.name }}
        </NuxtLink>

        <button @click="handleRemove" class="sm:hidden text-gray-400 hover:text-red-500">
          <Icon name="ph:trash-fill" size="20" />
        </button>
      </div>

      <p class="text-xs text-gray-500 line-clamp-1">
        {{ $t('product.sku') }}: {{ item.id }} • {{ item.brand ? item.brand.name : $t('product.default_warranty') }}
      </p>

      <div class="mt-2 flex flex-wrap items-end justify-between gap-4 sm:mt-0">
        <div class="flex items-center gap-x-3 rounded-lg bg-gray-50 p-1">
          <button @click="decrement" :disabled="item.quantity <= 1" class="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-blue disabled:opacity-50">
            <Icon name="ph:minus-bold" size="14" />
          </button>
          <span class="w-4 text-center text-sm font-bold text-gray-900">{{ item.quantity }}</span>
          <button @click="increment" :disabled="item.stock && item.quantity >= item.stock" class="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-brand-blue disabled:opacity-50">
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
        <span class="text-xs">{{ isLiked ? $t('profile.wishlist') : $t('profile.wishlist') }}</span>
        <Icon
            :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'"
            size="18"
            :class="isLiked ? 'text-brand-red' : 'group-hover:scale-110 transition-transform'"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { format } = useCurrency();
const { showToast } = useToast();
const { t } = useI18n();
const localePath = useLocalePath();

const isLiked = computed(() => wishlistStore.isInWishlist(props.item.id));

const increment = () => {
  if (props.item.stock && props.item.quantity >= props.item.stock) {
    showToast(t('product.no_stock'), 'warning');
    return;
  }
  cartStore.updateQuantity(props.item.id, props.item.quantity + 1);
};

const decrement = () => {
  if (props.item.quantity > 1) {
    cartStore.updateQuantity(props.item.id, props.item.quantity - 1);
  } else {
    cartStore.removeFromCart(props.item.id);
  }
};

const handleRemove = () => {
  cartStore.removeFromCart(props.item.id);
};

const handleWishlist = () => {
  wishlistStore.toggleWishlist(props.item);
};
</script>