<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-200">

      <div class="text-center mb-8">
        <img src="/logo.png" alt="MYCOM" class="h-12 mx-auto mb-4">
        <h1 class="text-2xl font-black text-brand-dark-blue">Сайт на обслуживании</h1>
        <p class="text-sm text-gray-500 mt-2">Введите логин и пароль для доступа к разработке</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Логин</label>
          <input
              v-model="form.login"
              type="text"
              class="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-brand-dark-blue focus:border-brand-blue outline-none transition-all"
              placeholder="Логин"
          >
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Пароль</label>
          <input
              v-model="form.password"
              type="password"
              class="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-brand-dark-blue focus:border-brand-blue outline-none transition-all"
              placeholder="Пароль"
          >
        </div>

        <p v-if="error" class="text-center text-xs font-bold text-red-500">{{ error }}</p>

        <button
            type="submit"
            class="w-full h-12 rounded-xl bg-brand-blue text-white font-black uppercase tracking-widest hover:bg-brand-dark-blue transition-all active:scale-95"
        >
          Войти
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Отключаем стандартный лейаут, чтобы скрыть шапку и подвал
definePageMeta({
  layout: false
});

const form = ref({ login: '', password: '' });
const error = ref('');
const siteAccessCookie = useCookie('site_access_token', { maxAge: 60 * 60 * 24 * 7 }); // Кука на 7 дней
const router = useRouter();

const handleLogin = () => {
  // Простая проверка (Hardcoded)
  if (form.value.login === 'admin' && form.value.password === 'admin') {
    siteAccessCookie.value = 'granted'; // Устанавливаем куку
    router.push('/'); // Редирект на главную
  } else {
    error.value = 'Неверный логин или пароль';
  }
};
</script>