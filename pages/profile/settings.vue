<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('profile.settings') }}</h2>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="rounded-[32px] bg-white p-8 shadow-sm border border-gray-100 lg:col-span-2">

        <!-- SKELETON -->
        <div v-if="authStore.isLoading && !authStore.user" class="animate-pulse space-y-6">
          <div class="h-4 w-32 bg-gray-100 rounded"></div>
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="h-14 bg-gray-100 rounded-2xl"></div>
            <div class="h-14 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>

        <form v-else @submit.prevent="handleSave" class="space-y-8">
          <div class="space-y-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{{ $t('profile.personal_info') }}</h3>

            <div class="grid gap-6 sm:grid-cols-2">
              <!-- NAME -->
              <div>
                <label class="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{{ $t('profile.full_name') }}</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                    <Icon name="ph:user-bold" size="18" />
                  </span>
                  <input
                      v-model="formData.name"
                      type="text"
                      class="w-full rounded-2xl border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm font-bold text-brand-dark-blue transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/5 outline-none"
                      :placeholder="$t('profile.full_name')"
                  >
                </div>
              </div>

              <!-- PHONE (Disabled) -->
              <div>
                <label class="mb-2 block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{{ $t('auth.enter_phone') }}</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon name="ph:phone-bold" size="18" />
                  </span>
                  <input
                      :value="formatPhone(formData.phone)"
                      type="tel"
                      disabled
                      class="w-full cursor-not-allowed rounded-2xl border-gray-100 bg-gray-100/50 py-4 pl-12 pr-12 text-sm font-bold text-gray-400"
                  >
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <Icon name="ph:lock-key-fill" size="18" />
                  </span>
                </div>
                <p class="mt-2 text-[10px] text-gray-400 italic">{{ $t('profile.phone_change_not_allowed') }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-50 pt-8">
            <button
                type="submit"
                :disabled="isSubmitting"
                class="flex items-center gap-3 rounded-2xl bg-brand-blue px-10 py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/20 transition-all hover:bg-brand-dark-blue active:scale-95 disabled:opacity-50"
            >
              <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" size="18" />
              <span>{{ $t('common.save') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Security Info -->
      <div class="rounded-[40px] bg-blue-50/30 p-10 border border-blue-100 h-fit">
        <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-8 ring-blue-50/50">
          <Icon name="ph:shield-check-fill" size="32" />
        </div>
        <h3 class="text-xl font-black text-brand-dark-blue">{{ $t('profile.security') }}</h3>
        <p class="mt-3 text-sm text-gray-500 leading-relaxed font-medium">
          {{ $t('profile.security_text') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

definePageMeta({ layout: 'profile', middleware: 'auth' });

const authStore = useAuthStore();
const { call } = useApi();
const { showToast } = useToast();
const { t } = useI18n();

const formData = ref({ name: '', phone: '' });
const isSubmitting = ref(false);

// Синхронизация формы с данными пользователя при загрузке
watchEffect(() => {
  if (authStore.user) {
    formData.value.name = authStore.user.name || '';
    formData.value.phone = authStore.user.phone || '';
  }
});

const handleSave = async () => {
  if (!formData.value.name.trim()) {
    showToast(t('common.error_empty_field'), 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    await call('/api/v1/site/profile/update', {
      method: 'POST',
      body: { name: formData.value.name }
    });

    // 🔥 Обновляем стор, чтобы имя сменилось везде
    await authStore.fetchUser();

    showToast(t('common.save_success'));
  } catch (e: any) {
    showToast(e.data?.message || t('common.error_generic'), 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const formatPhone = (phone: string) => {
  const d = phone?.replace(/\D/g, '') || '';
  if (d.length === 12) {
    return `+${d.slice(0, 3)} (${d.slice(3, 5)}) ${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
  }
  return phone;
};

useSeoMeta({ title: () => `${t('profile.settings')} | MYCOM` });
</script>