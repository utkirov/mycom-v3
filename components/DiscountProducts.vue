<template>
  <section class="discount-section">
    <div class="section-header">
      <h2 class="section-title">{{ t('home.flash_sale_mobile') }}</h2>
      <div class="navigation">
        <button class="nav-button"><Icon name="ph:caret-left" size="20" /></button>
        <button class="nav-button"><Icon name="ph:caret-right" size="20" /></button>
      </div>
    </div>
    <div class="content-grid">
      <CountdownTimer />
      <div class="products-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n(); // Переход на официальный i18n
defineProps({ products: { type: Array, required: true } });
</script>

<style scoped>
.discount-section { margin-bottom: 40px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title { font-size: 24px; font-weight: 600; }
.navigation { display: flex; gap: 10px; }
.nav-button {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1px solid #ddd; background-color: #fff;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.content-grid {
  display: grid;
  grid-template-columns: 2fr 10fr;
  gap: 20px;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}
</style>