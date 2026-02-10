<template>
  <footer class="bg-white border-t border-gray-100 mt-20 pt-16 pb-8">
    <div class="w-full px-4 sm:px-6 md:px-8 mx-auto">

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

        <!-- 1. Лого и Соцсети -->
        <div class="lg:col-span-4">
          <NuxtLink :to="localePath('/')" class="inline-block mb-6" aria-label="MYCOM Home">
            <img src="/logo.png" alt="MYCOM" class="h-10 w-auto" width="120" height="40">
          </NuxtLink>
          <p class="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
            {{ $t('common.footer_about') }}
          </p>
          <div class="flex items-center gap-3">
            <a
                v-for="social in siteStore.settings?.socials"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="nofollow noopener noreferrer"
                class="footer-social-link"
                :aria-label="social.name"
            >
              <Icon :name="getSocialIcon(social.name)" size="20" />
            </a>
          </div>
        </div>

        <!-- 2. Покупателям -->
        <div class="lg:col-span-2">
          <h4 class="footer-title">{{ $t('common.for_customers') }}</h4>
          <nav class="flex flex-col gap-y-3">
            <NuxtLink :to="localePath('/delivery')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:truck" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.delivery') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/warranty')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:shield-check" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.warranty') }}
            </NuxtLink>
          </nav>
        </div>

        <!-- 3. Компания -->
        <div class="lg:col-span-2">
          <h4 class="footer-title">{{ $t('common.company') }}</h4>
          <nav class="flex flex-col gap-y-3">
            <NuxtLink :to="localePath('/about')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:info" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.about') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/contacts')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:phone" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.contacts') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/terms')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:file-text" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.terms') }}
            </NuxtLink>
          </nav>
        </div>

        <!-- 4. ВАРИАНТЫ ОПЛАТЫ -->
        <div class="lg:col-span-4 bg-gray-50 rounded-[32px] p-8">
          <h4 class="text-lg font-black text-brand-dark-blue mb-6">
            {{ $t('delivery.payment_methods_title') }}
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Payme -->
            <div class="payment-card">
              <img src="/icons/payme.svg" alt="Payme" class="h-6 w-auto object-contain">
            </div>

            <!-- Click / Uzcard / Humo -->
            <div class="payment-card gap-2">
              <img src="/icons/uzcard.png" alt="Uzcard" class="h-6 w-auto object-contain">
              <span class="w-px h-4 bg-gray-200"></span>
              <img src="/icons/humo.png" alt="Humo" class="h-6 w-auto object-contain">
            </div>
          </div>

          <p class="text-[11px] text-gray-400 mt-6 leading-relaxed font-medium">
            {{ $t('delivery.payment_methods_desc') }}
          </p>
        </div>

      </div>

      <!-- Нижняя полоса -->
      <div class="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
          © {{ new Date().getFullYear() }} MYCOM.uz. {{ $t('common.all_rights_reserved') }}
        </p>

        <div class="hidden md:block text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Developed by ❤ INSAFF TEAM
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
const siteStore = useSiteStore();
const localePath = useLocalePath();

const getSocialIcon = (name) => {
  const map = {
    'Telegram': 'ph:paper-plane-tilt-fill',
    'Instagram': 'ph:instagram-logo-fill',
    'Facebook': 'ph:facebook-logo-fill'
  };
  return map[name] || 'ph:link-bold';
};
</script>

<style scoped>
.footer-title {
  @apply text-xs font-black uppercase tracking-[0.2em] text-brand-dark-blue mb-6;
}
.footer-link {
  @apply text-sm font-bold text-gray-500 hover:text-brand-blue transition-colors;
}
.footer-social-link {
  @apply flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all hover:bg-brand-blue hover:text-white hover:shadow-lg hover:shadow-brand-blue/20;
}
.payment-card {
  @apply flex h-14 items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md px-4;
}
</style>