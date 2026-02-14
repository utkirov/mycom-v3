<template>
  <div class="flex flex-col min-h-screen">
    <LayoutAppHeader />

    <main class="pt-20 md:pt-[120px] flex-grow pb-20 md:pb-0 overflow-x-hidden">
      <slot />
    </main>

    <LayoutAppFooter class="hidden md:block" />
    <LayoutAppFooter class="md:hidden pb-24" />

    <AuthModal />
    <CommonToastNotification />
    <CommonAppPreloader />

    <!-- ДОБАВЛЕНО: Слой анимации полета -->
    <UiCartFlyLayer />

    <div class="mb-16 md:mb-0">
      <CommonFloatingContactButton />
    </div>

    <LayoutBottomNav />
  </div>
</template>