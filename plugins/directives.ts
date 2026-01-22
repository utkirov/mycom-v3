// file: plugins/directives.ts
import { phoneFormat } from '~/directives/phoneFormat'; // Import our directive logic

export default defineNuxtPlugin((nuxtApp) => {
    // Register it globally with the name 'phone-format'
    nuxtApp.vueApp.directive('phone-format', phoneFormat);
});