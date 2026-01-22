<template>
  <div class="min-h-screen bg-profile-bg flex flex-col">
    <LayoutAppHeader />

    <!-- Добавлен pb-20 для мобильных -->
    <main class="pt-20 pb-24 md:pt-[130px] md:pb-20 flex-grow">
      <div class="container mx-auto px-4 sm:px-6 md:px-8">

        <h1 class="mb-6 text-2xl font-extrabold text-brand-dark-blue sm:text-3xl lg:text-4xl md:mb-8">
          {{ t('profile.title') }}
        </h1>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">

          <aside class="md:col-span-4 lg:col-span-3">
            <div class="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 sticky top-24">

              <div class="border-b border-gray-100 bg-gray-50/50 p-5">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white shadow-md shadow-brand-blue/20">
                    <Icon name="ph:user-fill" size="24" />
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">{{ t('profile.default_user') }}</p>
                    <p class="truncate text-sm font-bold text-brand-dark-blue md:text-base">
                      {{ authStore.user?.name || '...' }}
                    </p>
                  </div>
                </div>
              </div>

              <nav class="flex flex-col gap-1 p-2">
                <NuxtLink :to="localePath('/profile')" class="nav-item" active-class="nav-item-active" exact-active-class="nav-item-active">
                  <Icon name="ph:squares-four" size="20" />
                  <span>{{ t('profile.overview') }}</span>
                </NuxtLink>

                <NuxtLink :to="localePath('/profile/orders')" class="nav-item" active-class="nav-item-active">
                  <Icon name="ph:package" size="20" />
                  <span>{{ t('profile.orders') }}</span>
                </NuxtLink>

                <NuxtLink :to="localePath('/wishlist')" class="nav-item" active-class="nav-item-active">
                  <Icon name="ph:heart" size="20" />
                  <span>{{ t('profile.wishlist') }}</span>
                </NuxtLink>

                <NuxtLink :to="localePath('/profile/reviews')" class="nav-item" active-class="nav-item-active">
                  <Icon name="ph:star" size="20" />
                  <span>{{ t('profile.my_reviews') }}</span>
                </NuxtLink>

                <NuxtLink :to="localePath('/profile/settings')" class="nav-item" active-class="nav-item-active">
                  <Icon name="ph:gear" size="20" />
                  <span>{{ t('profile.settings') }}</span>
                </NuxtLink>

                <div class="my-1 border-t border-gray-100"></div>

                <button @click="handleLogout" class="nav-item text-red-500 hover:bg-red-50 hover:text-red-600 w-full text-left">
                  <Icon name="ph:sign-out" size="20" />
                  <span>{{ t('profile.logout') }}</span>
                </button>
              </nav>
            </div>
          </aside>

          <div class="md:col-span-8 lg:col-span-9">
            <slot />
          </div>

        </div>
      </div>
    </main>

    <LayoutAppFooter class="hidden md:block" />
    <LayoutAppFooter class="md:hidden pb-20" />

    <LayoutBottomNav />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const { t } = useI18n();
const localePath = useLocalePath();
const { showToast } = useToast();
const router = useRouter();

const handleLogout = async () => {
  if (confirm(t('profile.logout_confirm'))) {
    authStore.logout();
    showToast(t('profile.logout'));
    router.push(localePath('/'));
  }
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-brand-dark-blue;
}
.nav-item-active {
  @apply bg-blue-50 text-brand-blue shadow-sm;
}
</style>