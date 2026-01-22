<template>
  <teleport to="body">
    <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0"
        enter-to-class="transform opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100"
        leave-to-class="transform opacity-0"
    >
      <div v-if="uiStore.isAuthModalOpen" @click="uiStore.closeAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div @click.stop class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div class="relative text-center">
            <button @click="uiStore.closeAuthModal" class="absolute -top-4 -right-4 text-gray-400 hover:text-gray-800">
              <Icon name="ph:x-circle" size="28" />
            </button>
            <img src="/logo.png" alt="MYCOM Logo" class="mx-auto h-10">
          </div>

          <!-- LOGIN STEP -->
          <div v-if="uiStore.authModalStep === 'login'">
            <h2 class="mt-6 text-center text-2xl font-bold text-brand-dark-blue">{{ $t('auth.login_title') }}</h2>
            <form @submit.prevent="handleRequestOtp" class="mt-6 space-y-4">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base text-gray-500">
                  +998
                </div>
                <input
                    v-model="phoneRaw"
                    v-phone-format type="tel"
                    placeholder="(XX) XXX-XX-XX"
                    class="h-14 w-full rounded-lg border-gray-300 pl-[70px] text-base focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <button type="submit" :disabled="authStore.isLoading || !isPhoneComplete" class="h-14 w-full rounded-lg bg-brand-blue font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {{ authStore.isLoading ? $t('common.loading') : $t('auth.get_code') }}
              </button>
            </form>
          </div>

          <!-- OTP STEP -->
          <div v-else-if="uiStore.authModalStep === 'otp'">
            <div class="text-center">
              <button @click="uiStore.setAuthStep('login')" class="absolute left-4 top-4 text-gray-500 hover:text-brand-blue flex items-center gap-1">
                <Icon name="ph:caret-left" /> {{ $t('common.back') }}
              </button>
              <h2 class="mt-6 text-2xl font-bold text-brand-dark-blue">{{ $t('auth.enter_code') }}</h2>
              <p class="mt-2 text-gray-600">{{ $t('auth.code_sent') }} <br> <span class="font-semibold">{{ uiStore.authModalPhone }}</span></p>
            </div>
            <div class="mt-6 flex justify-center gap-x-2">
              <input
                  v-for="(n, index) in 6" :key="index"
                  ref="otpInputs"
                  @input="handleOtpInput(index, $event)"
                  @keydown.backspace="handleBackspace(index, $event)"
                  @paste="handlePaste"
                  type="text"
                  pattern="[0-9]*" inputmode="numeric"
                  maxlength="1"
                  class="h-14 w-12 rounded-lg border-2 border-gray-300 text-center text-2xl font-bold focus:border-brand-blue focus:ring-brand-blue"
              >
            </div>
            <p class="mt-4 text-center text-sm text-gray-500">
              <span v-if="resendTimer > 0">{{ $t('auth.resend_after', { s: resendTimer }) }}</span>
              <button v-else @click="handleRequestOtp" :disabled="authStore.isLoading" class="font-semibold text-brand-blue hover:underline disabled:opacity-50">{{ $t('auth.resend_code') }}</button>
            </p>
            <button @click="handleVerifyOtp" :disabled="authStore.isLoading || otpCode.length !== 6" class="mt-4 h-14 w-full rounded-lg bg-brand-blue font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {{ authStore.isLoading ? $t('common.loading') : $t('auth.verify') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted, computed } from 'vue';

const uiStore = useUIStore();
const authStore = useAuthStore();
const { t } = useI18n();
const router = useRouter(); // <-- Добавили

const phoneRaw = ref('');
const phoneDigits = computed(() => phoneRaw.value.replace(/\D/g, ''));
const isPhoneComplete = computed(() => phoneDigits.value.length === 9);

const otpInputs = ref<HTMLInputElement[]>([]);
const otpCode = ref('');
const resendTimer = ref(0);
let timerInterval: any = null;

const updateOtpCode = () => {
  otpCode.value = otpInputs.value.map(input => input?.value || '').join('');
};

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/[^0-9]/g, '');
  target.value = value;
  updateOtpCode();
  if (value && index < otpInputs.value.length - 1) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleBackspace = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;
  if (!target.value && index > 0) {
    otpInputs.value[index - 1]?.focus();
    if(otpInputs.value[index - 1]) otpInputs.value[index - 1].value = '';
  } else {
    target.value = '';
  }
  updateOtpCode();
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6);
  if (!pasteData) return;
  pasteData.split('').forEach((char, index) => {
    if (otpInputs.value[index]) otpInputs.value[index].value = char;
  });
  updateOtpCode();
  const focusIndex = Math.min(pasteData.length, otpInputs.value.length - 1);
  otpInputs.value[focusIndex]?.focus();
};

const startResendTimer = () => {
  resendTimer.value = 60;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) resendTimer.value--;
    else clearInterval(timerInterval);
  }, 1000);
};

const handleRequestOtp = async () => {
  const fullPhone = '998' + (uiStore.authModalStep === 'login' ? phoneDigits.value : uiStore.authModalPhone.replace(/\D/g, '').slice(-9));
  const success = await authStore.requestOtp(fullPhone);
  if (success) {
    if (uiStore.authModalStep === 'login') {
      uiStore.setAuthStep('otp', `+998 ${phoneRaw.value}`);
    } else {
      startResendTimer();
    }
  }
};

const handleVerifyOtp = async () => {
  const fullPhone = uiStore.authModalPhone.replace(/\D/g, '');
  const success = await authStore.verifyOtp(fullPhone, otpCode.value);
  if (success) {
    uiStore.closeAuthModal();

    // --- НОВОЕ: Редирект после логина ---
    if (uiStore.returnUrl) {
      router.push(uiStore.returnUrl);
      uiStore.setReturnUrl(null); // Очищаем после использования
    }

  } else {
    otpInputs.value.forEach(input => input.value = '');
    updateOtpCode();
    otpInputs.value[0]?.focus();
  }
};

watch(() => uiStore.authModalStep, (newStep) => {
  if (newStep === 'otp') {
    startResendTimer();
    nextTick(() => otpInputs.value[0]?.focus());
  } else {
    if (timerInterval) clearInterval(timerInterval);
    resendTimer.value = 0;
  }
}, { immediate: true });

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });
</script>