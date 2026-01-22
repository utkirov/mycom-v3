<template>
  <div class="flex items-center gap-3">
    <div v-for="unit in timeUnits" :key="unit.label" class="flex flex-col items-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <span class="font-unbounded text-lg font-bold text-brand-blue">{{ unit.value }}</span>
      </div>
      <span class="mt-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  endDate: { type: String, required: true }
});

const { t } = useI18n();
const timeLeft = ref({ d: '00', h: '00', m: '00', s: '00' });

const timeUnits = computed(() => [
  { value: timeLeft.value.d, label: t('home.timer_days_short') },
  { value: timeLeft.value.h, label: t('home.timer_hours_short') },
  { value: timeLeft.value.m, label: t('home.timer_minutes_short') },
  { value: timeLeft.value.s, label: t('home.timer_seconds_short') }
]);

const updateTimer = () => {
  const diff = new Date(props.endDate).getTime() - new Date().getTime();
  if (diff <= 0) return;

  timeLeft.value = {
    d: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
    h: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
    m: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0'),
    s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
  };
};

let timer;
onMounted(() => {
  updateTimer();
  timer = setInterval(updateTimer, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>