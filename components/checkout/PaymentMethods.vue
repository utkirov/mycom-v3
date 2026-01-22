<template>
  <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
    <h2 class="text-xl font-bold text-brand-dark-blue mb-6 flex items-center gap-2">
      <Icon name="ph:credit-card-fill" class="text-brand-blue" />
      {{ $t('checkout.payment_method') }}
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all"
          :class="modelValue === method.id ? 'border-brand-blue bg-blue-50/30 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200'"
      >
        <input
            type="radio"
            name="payment_method"
            :value="method.id"
            :checked="modelValue === method.id"
            @change="$emit('update:modelValue', method.id)"
            class="hidden"
        >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <Icon :name="method.icon" size="24" :class="modelValue === method.id ? 'text-brand-blue' : 'text-gray-400'" />
        </div>
        <div>
          <p class="text-sm font-bold text-brand-dark-blue">{{ method.name }}</p>
          <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{{ method.description }}</p>
        </div>
        <Icon
            v-if="modelValue === method.id"
            name="ph:check-circle-fill"
            class="absolute right-4 top-4 text-brand-blue"
            size="20"
        />
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true }
});

defineEmits(['update:modelValue']);

const { t } = useI18n();

const paymentMethods = computed(() => [
  {
    id: 'payme',
    name: 'Payme',
    description: t('checkout.online_payment'),
    icon: 'ph:globe-bold'
  },
]);
</script>