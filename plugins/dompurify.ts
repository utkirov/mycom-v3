// plugins/dompurify.ts
import DOMPurify from 'isomorphic-dompurify'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('sanitize', {
        mounted(el, binding) {
            el.innerHTML = DOMPurify.sanitize(binding.value || '')
        },
        updated(el, binding) {
            if (binding.value !== binding.oldValue) {
                el.innerHTML = DOMPurify.sanitize(binding.value || '')
            }
        }
    })
})