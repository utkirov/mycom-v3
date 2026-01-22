<template>
  <footer class="bg-white border-t border-gray-100 mt-20 pt-16 pb-8">
    <div class="w-full px-4 sm:px-6 md:px-8 mx-auto">

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

        <!-- Лого и Соцсети -->
        <div class="lg:col-span-4">
          <NuxtLink :to="localePath('/')" class="inline-block mb-6">
            <img src="/logo.png" alt="MYCOM" class="h-10 w-auto">
          </NuxtLink>
          <p class="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
            {{ $t('common.footer_about') }}
          </p>
          <div class="flex items-center gap-3">
            <a v-for="social in siteStore.settings?.socials" :key="social.name" :href="social.url" target="_blank" class="footer-social-link">
              <Icon :name="getSocialIcon(social.name)" size="20" />
            </a>
          </div>
        </div>

        <!-- Покупателям (Убрали лишнее) -->
        <div class="lg:col-span-2">
          <h4 class="footer-title">{{ $t('common.for_customers') }}</h4>
          <nav class="flex flex-col gap-y-3">
            <NuxtLink :to="localePath('/delivery')" class="footer-link group flex items-center gap-2">
              <Icon name="ph:truck" class="text-gray-300 group-hover:text-brand-blue transition-colors" />
              {{ $t('common.delivery') }}
            </NuxtLink>
            <!-- Ссылки на Гарантию, Trade-In и Трекинг удалены по запросу -->
          </nav>
        </div>

        <!-- Компания (Добавили иконки) -->
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

        <!-- Подписка -->
        <div class="lg:col-span-4 bg-gray-50 rounded-[32px] p-8">
          <h4 class="text-lg font-black text-brand-dark-blue mb-2">{{ $t('common.subscribe_title') }}</h4>
          <p class="text-xs text-gray-500 mb-6 font-medium">{{ $t('common.subscribe_text') }}</p>
          <form @submit.prevent="handleSubscribe" class="relative">
            <input
                type="email"
                placeholder="E-mail"
                class="w-full h-14 rounded-2xl border border-gray-200 bg-white px-6 pr-32 text-sm font-bold focus:border-brand-blue outline-none transition-all"
            >
            <button class="absolute right-1.5 top-1.5 h-11 px-6 rounded-xl bg-brand-blue text-xs font-black text-white uppercase tracking-widest hover:bg-brand-dark-blue transition-all">
              OK
            </button>
          </form>
        </div>

      </div>

      <div class="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          © {{ new Date().getFullYear() }} MYCOM.uz. {{ $t('common.all_rights_reserved') }}
        </p>

        <div class="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <img src="/icons/payme.svg" alt="Payme" class="h-4">
          <img src="/icons/uzum.svg" alt="Uzum" class="h-4">
          <img src="/icons/uzcard.png" alt="Uzcard" class="h-4">
          <img src="/icons/humo.png" alt="Humo" class="h-4">
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
const siteStore = useSiteStore();
const { t } = useI18n();
const localePath = useLocalePath();
const { showToast } = useToast();

const getSocialIcon = (name) => {
  const map = { 'Telegram': 'ph:paper-plane-tilt-fill', 'Instagram': 'ph:instagram-logo-fill', 'Facebook': 'ph:facebook-logo-fill' };
  return map[name] || 'ph:link-bold';
};

const handleSubscribe = () => {
  showToast(t('common.subscribe_success'), 'success');
};
</script>

<style scoped>
.footer-title { @apply text-xs font-black uppercase tracking-[0.2em] text-brand-dark-blue mb-6; }
.footer-link { @apply text-sm font-bold text-gray-400 hover:text-brand-blue transition-colors; }
.footer-social-link { @apply flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-all hover:bg-brand-blue hover:text-white hover:shadow-lg hover:shadow-brand-blue/20; }
</style>