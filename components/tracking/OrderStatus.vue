<template>
  <div class="rounded-xl bg-white p-6 shadow-sm mt-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-xl font-bold">{{ t('profile.order_number', { id: order.id }) }}</h2>
        <p class="text-gray-500">{{ t('tracking.estimated_delivery') }}: {{ order.estimatedDelivery || '—' }}</p>
      </div>
      <div class="mt-4 md:mt-0">
        <span class="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">{{ getStatusText(order.status) }}</span>
      </div>
    </div>

    <div class="mt-8 flex justify-between">
      <div v-for="(step, index) in steps" :key="step.key" class="flex-1 text-center">
        <div class="flex items-center justify-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full" :class="index <= currentStepIndex ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-500'">
            <Icon :name="step.icon" size="24" />
          </div>
          <div v-if="index < steps.length - 1" class="h-1 w-full" :class="index < currentStepIndex ? 'bg-brand-blue' : 'bg-gray-200'"></div>
        </div>
        <p class="mt-2 text-xs font-semibold" :class="index <= currentStepIndex ? 'text-brand-blue' : 'text-gray-500'">{{ t(`status.${step.key}`) }}</p>
      </div>
    </div>

    <div class="mt-8 border-t pt-6">
      <h3 class="font-bold">{{ t('checkout.order_content') || 'Состав заказа' }}</h3>
      <div class="mt-4 space-y-4">
        <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4">
          <img :src="item.image" class="h-16 w-16 rounded-lg bg-gray-100 object-contain">
          <div>
            <p class="text-sm font-semibold">{{ item.name }}</p>
            <p class="text-sm text-gray-500">{{ item.quantity }} шт.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: { type: Object, required: true }
});
const { t } = useI18n(); // Переход на официальный i18n

const steps = [
  { key: 'pending', icon: 'ph:package' },
  { key: 'shipping', icon: 'ph:truck' },
  { key: 'delivered', icon: 'ph:check-circle' }
];

const currentStepIndex = computed(() => {
  return steps.findIndex(step => step.key === props.order.status);
});

const getStatusText = (status) => {
  return t(`status.${status}`) || status;
};
</script>