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
      <div v-if="uiStore.isAuthModalOpen" @click="uiStore.closeAuthModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div @click.stop class="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl relative overflow-hidden">

          <button @click="uiStore.closeAuthModal" class="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100">
            <Icon name="ph:x-bold" size="24" />
          </button>

          <div class="text-center mb-6">
            <img src="/logo.png" alt="MYCOM" class="h-8 mx-auto mb-4">
          </div>

          <!-- LOGIN STEP -->
          <div v-if="uiStore.authModalStep === 'login'" class="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 class="text-2xl font-black text-brand-dark-blue text-center mb-2">{{ $t('auth.login_title') }}</h2>
            <p class="text-center text-gray-500 text-sm mb-8">{{ $t('auth.login_full_title') }}</p>

            <form @submit.prevent="handleRequestOtp" class="space-y-4">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span class="text-brand-dark-blue font-bold text-lg">+998</span>
                </div>
                <input
                    v-model="phoneRaw"
                    v-phone-format
                    type="tel"
                    placeholder="(XX) XXX-XX-XX"
                    class="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-[70px] pr-4 text-lg font-bold text-brand-dark-blue outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                />
              </div>
              <button
                  type="submit"
                  :disabled="authStore.isLoading || !isPhoneComplete"
                  class="h-14 w-full rounded-2xl bg-brand-blue font-black text-white uppercase tracking-widest shadow-lg shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                <Icon v-if="authStore.isLoading" name="svg-spinners:ring-resize" class="mr-2" />
                {{ $t('auth.get_code') }}
              </button>
            </form>

            <p class="mt-6 text-center text-[10px] text-gray-400 leading-relaxed px-4">
              {{ $t('auth.terms_agreement') }}
              <NuxtLink to="/terms" class="underline hover:text-brand-blue">{{ $t('common.terms') }}</NuxtLink>
            </p>
          </div>

          <!-- OTP STEP -->
          <div v-else-if="uiStore.authModalStep === 'otp'" class="animate-in fade-in slide-in-from-right-4 duration-300">
            <button @click="uiStore.setAuthStep('login')" class="absolute left-6 top-6 text-gray-400 hover:text-brand-blue flex items-center gap-1 text-sm font-bold transition-colors">
              <Icon name="ph:caret-left-bold" /> {{ $t('common.back') }}
            </button>

            <div class="text-center mt-4">
              <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('auth.enter_code') }}</h2>
              <p class="mt-2 text-gray-500 text-sm">
                {{ $t('auth.code_sent') }} <br>
                <span class="font-bold text-brand-dark-blue">{{ uiStore.authModalPhone }}</span>
              </p>
            </div>

            <div class="mt-8 flex justify-center gap-2 sm:gap-3">
              <input
                  v-for="(n, index) in 6"
                  :key="index"
                  ref="otpInputs"
                  :class="{'!border-red-500 !ring-red-100 animate-shake': isError}"
                  @input="handleOtpInput(index, $event)"
                  @keydown="handleKeydown(index, $event)"
                  @paste="handlePaste"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-2xl font-bold text-brand-dark-blue focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all caret-brand-blue"
              >
            </div>

            <div class="mt-8">
              <button
                  @click="handleVerifyOtp"
                  :disabled="authStore.isLoading || otpCode.length !== 6"
                  class="h-14 w-full rounded-2xl bg-brand-blue font-black text-white uppercase tracking-widest shadow-lg shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                <Icon v-if="authStore.isLoading" name="svg-spinners:ring-resize" class="mr-2" />
                {{ $t('auth.verify') }}
              </button>
            </div>

            <p class="mt-6 text-center text-xs font-bold text-gray-500">
              <span v-if="resendTimer > 0">{{ $t('auth.resend_after', { s: resendTimer }) }}</span>
              <button v-else @click="handleRequestOtp" :disabled="authStore.isLoading" class="text-brand-blue hover:underline disabled:opacity-50">
                {{ $t('auth.resend_code') }}
              </button>
            </p>
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
const router = useRouter();

const phoneRaw = ref('');
const phoneDigits = computed(() => phoneRaw.value.replace(/\D/g, ''));
const isPhoneComplete = computed(() => phoneDigits.value.length === 9);

const otpInputs = ref<HTMLInputElement[]>([]);
const otpCode = ref('');
const resendTimer = ref(0);
const isError = ref(false);
let timerInterval: any = null;

const updateOtpCode = () => {
  otpCode.value = otpInputs.value.map(input => input?.value || '').join('');
  isError.value = false;
};

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value.replace(/[^0-9]/g, '');

  target.value = val; // Разрешаем только цифры

  if (val) {
    if (index < 5) otpInputs.value[index + 1]?.focus();
  }

  updateOtpCode();
  // Авто-отправка, если заполнили все поля
  if (otpCode.value.length === 6) handleVerifyOtp();
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;

  if (event.key === 'Backspace') {
    if (!target.value && index > 0) {
      // Если поле пустое, идем назад и стираем предыдущее
      otpInputs.value[index - 1]?.focus();
      // setTimeout нужен, чтобы не удалилось значение в предыдущем поле ДО фокуса (иногда бывает баг)
      // но чаще всего достаточно просто фокуса, если логика input обработает очистку
    }
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6);
  if (!pasteData) return;

  pasteData.split('').forEach((char, index) => {
    if (otpInputs.value[index]) otpInputs.value[index].value = char;
  });

  updateOtpCode();
  const focusIndex = Math.min(pasteData.length, 5);
  otpInputs.value[focusIndex]?.focus();

  if (pasteData.length === 6) handleVerifyOtp();
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
  if (otpCode.value.length !== 6) return;

  const fullPhone = uiStore.authModalPhone.replace(/\D/g, '');
  const success = await authStore.verifyOtp(fullPhone, otpCode.value);

  if (success) {
    uiStore.closeAuthModal();
    // Логика редиректа
    if (uiStore.returnUrl) {
      router.push(uiStore.returnUrl);
      uiStore.setReturnUrl(null);
    }
  } else {
    isError.value = true;
    otpCode.value = '';
    otpInputs.value.forEach(input => input.value = '');
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
    isError.value = false;
  }
});

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });
</script>

<style scoped>
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}
</style>