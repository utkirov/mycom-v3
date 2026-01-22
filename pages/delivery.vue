<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">

      <h1 class="text-4xl font-bold text-brand-dark-blue mb-8">
        {{ $t('common.delivery') }}
      </h1>

      <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <h2 class="text-2xl font-bold text-brand-dark-blue mt-10 mb-4">{{ $t('delivery.payment_methods_title') }}</h2>
        <p>{{ $t('delivery.payment_methods_desc') }}</p>
        <ul>
          <li><strong>{{ $t('delivery.cash_on_delivery_title') }}:</strong> {{ $t('delivery.cash_on_delivery_desc') }}</li>
          <li><strong>{{ $t('delivery.online_payment_title') }}:</strong> {{ $t('delivery.online_payment_desc') }}</li>
          <li><strong>{{ $t('delivery.installment_title') }}:</strong> {{ $t('delivery.installment_desc') }}</li>
          <li><strong>{{ $t('delivery.invoice_title') }}:</strong> {{ $t('delivery.invoice_desc') }}</li>
        </ul>

        <h2 class="text-2xl font-bold text-brand-dark-blue mt-10 mb-4">{{ $t('delivery.terms_title') }}</h2>
        <h3 class="text-xl font-semibold text-brand-dark-blue">{{ $t('delivery.tashkent_title') }}</h3>
        <p>{{ $t('delivery.tashkent_desc') }}</p>
        <ul>
          <li><strong>{{ $t('delivery.standard_delivery_title') }}:</strong> {{ $t('delivery.standard_delivery_desc') }}</li>
          <li><strong>{{ $t('delivery.timing_title') }}:</strong> {{ $t('delivery.timing_desc') }}</li>
        </ul>

        <h3 class="text-xl font-semibold text-brand-dark-blue mt-6">{{ $t('delivery.regions_title') }}</h3>
        <p>{{ $t('delivery.regions_desc') }}</p>
        <ul>
          <li><strong>{{ $t('delivery.regions_cost_title') }}:</strong> {{ $t('delivery.regions_cost_desc') }}</li>
          <li><strong>{{ $t('delivery.regions_timing_title') }}:</strong> {{ $t('delivery.regions_timing_desc') }}</li>
        </ul>

        <h3 class="text-xl font-semibold text-brand-dark-blue mt-6">{{ $t('checkout.pickup') }}</h3>
        <!-- ИСПРАВЛЕНИЕ: v-sanitize -->
        <p v-sanitize="$t('delivery.pickup_desc')"></p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('common.delivery')} | MYCOM`,
  description: () => t('seo.delivery_description')
});
</script>

<style scoped>
.prose :where(h2, h3):not(:where([class~="not-prose"] *)) { color: theme('colors.brand-dark-blue'); }
.prose :where(strong):not(:where([class~="not-prose"] *)) { color: theme('colors.brand-dark-blue'); }
.prose :where(ul > li):not(:where([class~="not-prose"] *))::before { background-color: theme('colors.brand-blue'); }
</style>