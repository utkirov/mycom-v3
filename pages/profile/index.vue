<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-black text-brand-dark-blue">{{ $t('profile.title') }}</h1>
      <button @click="handleLogout" class="flex items-center gap-2 text-sm font-bold text-brand-red hover:underline">
        <Icon name="ph:sign-out-bold" />
        {{ $t('profile.logout') }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4 mb-6">
          <div class="h-16 w-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Icon name="ph:user-circle-gear-fill" size="40" />
          </div>
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ $t('profile.full_name') }}</p>
            <h3 class="text-xl font-black text-brand-dark-blue">{{ authStore.user?.name || $t('common.loading') }}</h3>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between items-center py-3 border-b border-gray-50">
            <span class="text-sm text-gray-500">{{ $t('checkout.recipient_phone') }}:</span>
            <span class="text-sm font-bold text-brand-dark-blue">{{ authStore.user?.phone }}</span>
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-50">
            <span class="text-sm text-gray-500">Email:</span>
            <span class="text-sm font-bold text-brand-dark-blue">{{ authStore.user?.email || '—' }}</span>
          </div>
        </div>

        <NuxtLink :to="localePath('/profile/settings')">
          <button class="mt-6 w-full py-3 rounded-xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-brand-blue transition-all">
            {{ $t('profile.edit_data') }}
          </button>
        </NuxtLink>
      </div>

      <div class="bg-brand-blue rounded-3xl p-6 text-white shadow-lg shadow-brand-blue/20 flex flex-col justify-between">
        <div>
          <Icon name="ph:package-fill" size="32" class="mb-4 text-white/50" />
          <h3 class="text-lg font-bold">{{ $t('profile.orders') }}</h3>
          <p class="text-white/70 text-sm mt-1">{{ $t('profile.security_text') }}</p>
        </div>
        <NuxtLink :to="localePath('/profile/orders')" class="mt-8 flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all group">
          <span class="font-bold">{{ $t('common.view_all') }}</span>
          <Icon name="ph:arrow-right-bold" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'profile',
  middleware: 'auth'
});

const authStore = useAuthStore();
const { t } = useI18n();
const localePath = useLocalePath();

const handleLogout = () => {
  if (confirm(t('auth.login_title'))) { // Используем существующий ключ для подтверждения
    authStore.logout();
  }
};
</script>