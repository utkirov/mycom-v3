<template>
  <div class="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-brand-dark-blue flex items-center gap-2">
        <Icon name="ph:map-pin-fill" class="text-brand-blue" />
        {{ $t('checkout.address_title') }}
      </h2>

      <!-- Кнопка "Моя локация" (Снаружи) -->
      <button
          type="button"
          @click="getCurrentLocation"
          :disabled="isLocating"
          class="text-sm font-semibold text-brand-blue hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon v-if="isLocating" name="svg-spinners:ring-resize" />
        <Icon v-else name="ph:crosshair-simple" />
        {{ isLocating ? $t('common.loading') : ($t('checkout.select_on_map') || 'Моя локация') }}
      </button>
    </div>

    <!-- Кнопка открытия карты -->
    <div
        @click="openMapModal"
        class="group relative mb-6 h-24 w-full overflow-hidden rounded-xl border border-dashed border-brand-blue/30 bg-blue-50/50 cursor-pointer transition-all hover:bg-blue-50 hover:border-brand-blue flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-2 text-brand-blue">
        <Icon name="ph:map-trifold" size="32" class="group-hover:scale-110 transition-transform" />
        <span class="text-sm font-bold">{{ $t('checkout.select_on_map') || 'Указать адрес на карте' }}</span>
      </div>
    </div>

    <!-- Поля ввода -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="label">{{ $t('checkout.street') }} *</label>
        <input
            v-model="localData.address.street"
            @input="clearError('street')"
            type="text"
            :placeholder="$t('checkout.street_placeholder')"
            class="input-field"
            :class="{ 'input-error': errors?.street }"
        >
        <p v-if="errors?.street" class="error-text">{{ errors.street }}</p>
      </div>

      <div>
        <label class="label">{{ $t('checkout.house') }} *</label>
        <input
            v-model="localData.address.house"
            @input="clearError('house')"
            type="text"
            class="input-field"
            :class="{ 'input-error': errors?.house }"
            :placeholder="$t('checkout.house_placeholder')"
        >
        <p v-if="errors?.house" class="error-text">{{ errors.house }}</p>
      </div>

      <div>
        <label class="label">{{ $t('checkout.apartment') }}</label>
        <input v-model="localData.address.apartment" type="text" class="input-field" :placeholder="$t('checkout.apartment_num')">
      </div>

      <input type="hidden" :value="localData.address.lat">
      <input type="hidden" :value="localData.address.lng">

      <div class="sm:col-span-2 mt-2">
        <label class="label">{{ $t('checkout.comment') }}</label>
        <textarea
            v-model="localData.comment"
            rows="2"
            :placeholder="$t('checkout.comment_placeholder')"
            class="input-field resize-none"
        ></textarea>
      </div>
    </div>

    <!-- МОДАЛКА КАРТЫ -->
    <teleport to="body">
      <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="isMapOpen" class="fixed inset-0 z-[9999] bg-white flex flex-col">

          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/90 backdrop-blur z-20">
            <h3 class="font-bold text-lg text-brand-dark-blue">{{ $t('checkout.select_on_map') }}</h3>
            <button @click="closeMapModal" class="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
              <Icon name="ph:x-bold" size="20" />
            </button>
          </div>

          <div class="relative flex-1 bg-gray-100 w-full h-full">
            <div id="modal-map" class="absolute inset-0 w-full h-full z-0"></div>

            <div v-if="mapLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Icon name="svg-spinners:ring-resize" class="text-brand-blue" size="40" />
            </div>

            <!-- Кнопка "Моя локация" на карте (С ЛОАДЕРОМ) -->
            <button
                @click="getCurrentLocation"
                :disabled="isLocating"
                class="absolute bottom-24 right-4 md:bottom-8 md:right-4 z-[400] h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all active:scale-90 disabled:opacity-70 disabled:cursor-wait"
                title="Моя локация"
            >
              <Icon v-if="isLocating" name="svg-spinners:ring-resize" size="24" />
              <Icon v-else name="ph:crosshair-simple-bold" size="24" />
            </button>
          </div>

          <div class="p-4 border-t border-gray-100 bg-white z-20">
            <button
                @click="confirmMapSelection"
                class="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:bg-brand-dark-blue transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Icon name="ph:check-bold" size="20" />
              <span>{{ $t('common.save') || 'Подтвердить' }}</span>
            </button>
          </div>

        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed, nextTick } from 'vue';
import { useHead } from '#imports';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
const { showToast } = useToast(); // Для уведомлений об ошибках
const checkoutStore = useCheckoutStore();

const errors = computed(() => checkoutStore.formErrors);
const localData = ref({ ...props.modelValue });

const isMapOpen = ref(false);
const mapLoading = ref(true);
const isLocating = ref(false); // Состояние запроса геолокации
let map = null;
let marker = null;
const TASHKENT_COORDS = [41.2995, 69.2401];

useHead({
  link: [{ rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }],
  script: [{ src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', defer: true }]
});

// --- ГЕОЛОКАЦИЯ (Исправлено) ---
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showToast('Геолокация не поддерживается вашим браузером', 'error');
    return;
  }

  isLocating.value = true;

  navigator.geolocation.getCurrentPosition(
      (position) => {
        // Успех
        const { latitude, longitude } = position.coords;

        // 1. Обновляем данные
        updateLocalCoords(latitude, longitude);

        // 2. Если карта открыта - двигаем её
        if (map) {
          map.setView([latitude, longitude], 16);
          if (marker) marker.setLatLng([latitude, longitude]);
        } else {
          // Если карта закрыта, открываем модалку сразу с этой точкой
          openMapModal();
        }

        // 3. Ищем адрес
        fetchAddress(latitude, longitude).finally(() => {
          isLocating.value = false;
        });
      },
      (error) => {
        // Ошибка
        isLocating.value = false;
        console.error('Geo error:', error);

        let msg = 'Не удалось определить местоположение';
        if (error.code === 1) msg = 'Разрешите доступ к геолокации в настройках браузера';
        else if (error.code === 2) msg = 'Геолокация недоступна (проверьте GPS/интернет)';
        else if (error.code === 3) msg = 'Время ожидания геолокации истекло';

        showToast(msg, 'warning');
      },
      {
        enableHighAccuracy: true, // Просим GPS для точности
        timeout: 10000,
        maximumAge: 0
      }
  );
};

// ... Остальная логика карты ...

const openMapModal = async () => {
  isMapOpen.value = true;
  mapLoading.value = true;
  await nextTick();
  setTimeout(() => initMap(), 100);
};

const closeMapModal = () => {
  isMapOpen.value = false;
  if (map) { map.remove(); map = null; }
};

const confirmMapSelection = () => closeMapModal();

const clearError = (field) => {
  if (checkoutStore.formErrors[field]) checkoutStore.formErrors[field] = '';
};

const initMap = () => {
  if (!window.L || map) return;

  const startLat = localData.value.address.lat || TASHKENT_COORDS[0];
  const startLng = localData.value.address.lng || TASHKENT_COORDS[1];

  map = window.L.map('modal-map', { zoomControl: false }).setView([startLat, startLng], 13);
  window.L.control.zoom({ position: 'bottomleft' }).addTo(map);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

  const svgIcon = `
    <div class="relative flex items-center justify-center w-full h-full -mt-[38px]">
      <div class="absolute w-4 h-4 bg-brand-blue/50 rounded-full animate-ping bottom-0"></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#009FE3" class="w-12 h-12 drop-shadow-xl relative z-10">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    </div>`;

  const icon = window.L.divIcon({ className: 'custom-map-pin', html: svgIcon, iconSize: [48, 48], iconAnchor: [24, 48] });
  marker = window.L.marker([startLat, startLng], { icon, draggable: true }).addTo(map);
  mapLoading.value = false;

  map.on('click', async (e) => {
    updateMarkerPosition(e.latlng.lat, e.latlng.lng);
    await fetchAddress(e.latlng.lat, e.latlng.lng);
  });
  marker.on('dragend', async (e) => {
    const { lat, lng } = e.target.getLatLng();
    updateLocalCoords(lat, lng);
    await fetchAddress(lat, lng);
  });
  setTimeout(() => map.invalidateSize(), 200);
};

const updateMarkerPosition = (lat, lng) => {
  if (marker) marker.setLatLng([lat, lng]);
  updateLocalCoords(lat, lng);
};

const updateLocalCoords = (lat, lng) => {
  localData.value.address.lat = lat;
  localData.value.address.lng = lng;
};

const fetchAddress = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`);
    const data = await res.json();
    if (data.address) {
      const road = data.address.road || '';
      const suburb = data.address.suburb || data.address.city_district || '';
      localData.value.address.street = [road, suburb].filter(Boolean).join(', ');
      clearError('street');
      if (data.address.house_number) {
        localData.value.address.house = data.address.house_number;
        clearError('house');
      }
    }
  } catch (e) { console.error('Address fetch error', e); }
};

watch(localData, (newValue) => { emit('update:modelValue', newValue); }, { deep: true });
onUnmounted(() => { if (map) { map.remove(); map = null; } });
</script>

<style scoped>
.label { @apply mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider; }
.input-field { @apply w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20 outline-none; }
.input-error { @apply border-brand-red bg-red-50 text-brand-red placeholder-red-300 focus:border-brand-red focus:ring-brand-red/20; }
.error-text { @apply mt-1 text-[10px] font-bold text-brand-red; }
:deep(.custom-map-pin) { background: transparent !important; border: none !important; }
:deep(.leaflet-pane) { z-index: 0; }
:deep(.leaflet-top), :deep(.leaflet-bottom) { z-index: 500; }
</style>