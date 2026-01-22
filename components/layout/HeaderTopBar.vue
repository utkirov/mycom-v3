<template>
  <div class="hidden border-b border-gray-100 bg-white text-sm md:block">
    <div class="w-full px-4 sm:px-6 md:px-8 mx-auto flex h-10 items-center justify-between">

      <nav class="flex items-center gap-x-6">
        <NuxtLink :to="localePath('/about')" class="top-bar-link">{{ $t('common.about') }}</NuxtLink>
        <NuxtLink :to="localePath('/delivery')" class="top-bar-link">{{ $t('common.delivery') }}</NuxtLink>
        <NuxtLink :to="localePath('/contacts')" class="top-bar-link">{{ $t('common.contacts') }}</NuxtLink>
      </nav>

      <div class="flex items-center gap-x-8">

        <div class="relative" ref="langDropdown">
          <button
              @click="isLangOpen = !isLangOpen"
              class="flex items-center gap-x-2 rounded-xl bg-gray-50 px-3 py-1.5 transition-all hover:bg-gray-100"
              :class="{ 'ring-2 ring-brand-blue/10 text-brand-blue': isLangOpen }"
          >
            <Icon name="ph:globe-bold" size="16" class="text-brand-blue" />
            <span class="text-[11px] font-black uppercase tracking-wider">{{ locale }}</span>
            <Icon
                name="ph:caret-down-bold"
                size="10"
                class="transition-transform duration-300"
                :class="{ 'rotate-180': isLangOpen }"
            />
          </button>

          <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-2"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div
                v-if="isLangOpen"
                class="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl z-50"
            >
              <div class="p-1.5 space-y-1">
                <button
                    v-for="lang in siteStore.languages"
                    :key="lang.value"
                    @click="changeLanguage(lang.value)"
                    class="group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
                    :class="locale === lang.value ? 'bg-blue-50 text-brand-blue' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark-blue'"
                >
                  <div class="flex items-center gap-3">
                    <img :src="`/icons/flag-${lang.value}.png`" class="h-4 w-4 rounded-full object-cover shadow-sm" @error="handleImgError" />
                    <span>{{ lang.name }}</span>
                  </div>
                  <Icon v-if="locale === lang.value" name="ph:check-circle-fill" size="16" />
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div class="flex items-center gap-x-4">
          <div class="flex items-center gap-x-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Icon name="ph:phone-fill" size="12" />
            </div>
            <a
                v-if="siteStore.settings?.phone"
                :href="`tel:${siteStore.settings.phone.replace(/\s/g, '')}`"
                class="text-sm font-black text-brand-dark-blue hover:text-brand-blue transition-colors"
            >
              {{ siteStore.settings.phone }}
            </a>
          </div>

          <div v-if="siteStore.settings?.socials?.length" class="flex items-center gap-x-2 border-l border-gray-100 pl-4">
            <a
                v-for="social in siteStore.settings.socials.slice(0, 2)"
                :key="social.name"
                :href="social.url"
                target="_blank"
                class="text-gray-300 hover:text-brand-blue transition-colors"
            >
              <Icon :name="getSocialIcon(social.name)" size="18" />
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const siteStore = useSiteStore();
const { locale, setLocale } = useI18n();
const localePath = useLocalePath();

const isLangOpen = ref(false);
const langDropdown = ref<HTMLElement | null>(null);

const changeLanguage = (code: string) => {
  setLocale(code);
  isLangOpen.value = false;
};

const getSocialIcon = (name: string) => {
  const map: Record<string, string> = {
    'Telegram': 'ph:paper-plane-tilt-fill',
    'Instagram': 'ph:instagram-logo-fill',
    'Facebook': 'ph:facebook-logo-fill'
  };
  return map[name] || 'ph:link-bold';
};

// Закрытие при клике вне элемента
const handleClickOutside = (event: MouseEvent) => {
  if (langDropdown.value && !langDropdown.value.contains(event.target as Node)) {
    isLangOpen.value = false;
  }
};

const handleImgError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = 'none';
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.top-bar-link {
  @apply text-[11px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-brand-dark-blue;
}
</style>