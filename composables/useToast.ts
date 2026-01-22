// composables/useToast.ts
export const useToast = () => {
    const isVisible = useState('toastVisible', () => false);
    const message = useState('toastMessage', () => '');
    const type = useState('toastType', () => 'success'); // 'success', 'error', 'warning', 'info'

    let timeoutId: any = null;

    const hideToast = () => {
        isVisible.value = false;
        if (timeoutId) clearTimeout(timeoutId);
    };

    const showToast = (msg: string, toastType = 'success', duration = 2000) => {
        message.value = msg;
        type.value = toastType;

        // Сбрасываем сначала, чтобы перезапустить анимацию, если тост уже виден
        isVisible.value = false;

        setTimeout(() => {
            isVisible.value = true;
        }, 50); // Небольшая задержка для сброса DOM

        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            hideToast();
        }, duration);
    };

    return { isVisible, message, type, showToast, hideToast };
};