<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold text-brand-dark-blue mb-8">{{ $t('common.contacts') }}</h1>

      <div v-if="siteStore.settings" class="space-y-10">
        <section>
          <h2 class="text-2xl font-bold text-brand-dark-blue mb-4">{{ $t('contacts.our_stores') }}</h2>
          <div class="space-y-4">
            <div v-for="(addr, idx) in siteStore.settings.addresses" :key="idx" class="flex gap-3 p-4 bg-gray-50 rounded-2xl">
              <Icon name="ph:map-pin-fill" size="24" class="text-brand-blue shrink-0" />
              <p class="text-gray-700 leading-relaxed">{{ addr.name }}</p>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">{{ $t('checkout.recipient_phone') }}</h3>
            <a :href="`tel:${siteStore.settings.phone}`" class="text-xl font-bold text-brand-dark-blue hover:text-brand-blue transition-colors">
              {{ siteStore.settings.phone }}
            </a>
          </div>
          <div>
            <h3 class="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Email</h3>
            <a :href="`mailto:${siteStore.settings.email}`" class="text-xl font-bold text-brand-dark-blue hover:text-brand-blue transition-colors">
              {{ siteStore.settings.email }}
            </a>
          </div>
        </section>
      </div>

      <div v-else class="py-20 text-center">
        <Icon name="svg-spinners:ring-resize" size="48" class="text-brand-blue" />
      </div>
    </div>
  </div>
</template>

<script setup>
const siteStore = useSiteStore();
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('common.contacts')} | MYCOM`
});
</script>