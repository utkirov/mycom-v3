<template>
  <div class="fixed bottom-44 lg:bottom-14 right-6 z-50">
    <div v-if="!isMenuOpen" class="absolute inset-0 animate-ping rounded-full bg-brand-blue/30"></div>

    <button
        @click="isMenuOpen = !isMenuOpen"
        class="relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 ease-in-out z-10"
        :class="isMenuOpen ? 'bg-brand-dark-blue rotate-[135deg]' : 'bg-brand-blue'"
    >
      <Icon :name="isMenuOpen ? 'ph:plus-bold' : 'ph:headset-fill'" size="32" class="text-white" />
    </button>

    <transition-group
        name="pop"
        tag="div"
        class="absolute bottom-20 right-0 flex flex-col items-end space-y-4"
    >
      <div v-if="isMenuOpen" v-for="item in contactItems" :key="item.name" class="flex items-center gap-4">
        <span class="px-4 py-2 bg-white rounded-2xl shadow-xl text-sm font-black text-brand-dark-blue whitespace-nowrap border border-gray-50">
          {{ item.name }}
        </span>
        <a
            :href="item.link"
            target="_blank"
            class="h-14 w-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95"
            :class="item.bgColor"
        >
          <Icon :name="item.icon" size="28" />
        </a>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isMenuOpen = ref(false);
const siteStore = useSiteStore();
const { t } = useI18n(); // Переход на i18n

const contactItems = computed(() => [
  { name: t('common.contact_tg'), icon: 'ph:paper-plane-tilt-fill', link: 'https://t.me/mycom_uz', bgColor: 'bg-[#0088cc]' },
  { name: t('common.contact_call'), icon: 'ph:phone-fill', link: `tel:${siteStore.settings?.phone}`, bgColor: 'bg-green-500' },
  { name: t('common.contact_ig'), icon: 'ph:instagram-logo-fill', link: 'https://instagram.com/mycom', bgColor: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' }
]);
</script>

<style scoped>
.pop-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { transition: all 0.2s ease-in; }
.pop-enter-from { opacity: 0; transform: scale(0.5) translateY(40px); }
.pop-leave-to { opacity: 0; transform: scale(0.5) translateY(20px); }
</style>