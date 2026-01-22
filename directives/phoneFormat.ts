// file: directives/phoneFormat.ts
import type { Directive } from 'vue';

// Helper function to format the digits
const formatPhoneNumber = (value: string): string => {
    if (!value) return '';

    // 1. Get only digits, max 9
    const digits = value.replace(/\D/g, '').slice(0, 9);

    // 2. Apply formatting based on length
    let formatted = '';

    // Если цифр нет, но были символы (например, юзер ввел буквы), возвращаем пустую строку
    if (digits.length === 0) {
        return '';
    }

    formatted = '(' + digits.slice(0, 2);

    if (digits.length > 2) {
        formatted += ') ' + digits.slice(2, 5);
    }
    if (digits.length > 5) {
        formatted += '-' + digits.slice(5, 7);
    }
    if (digits.length > 7) {
        formatted += '-' + digits.slice(7, 9);
    }

    return formatted;
};

// The directive object
export const phoneFormat: Directive<HTMLInputElement> = {
    mounted(el) {
        // Флаг для предотвращения рекурсии
        let isFormatting = false;

        const handleInput = (event: Event) => {
            // Если событие вызвано нами же — выходим
            if (isFormatting) return;

            const inputElement = event.target as HTMLInputElement;
            const originalValue = inputElement.value;
            const formattedValue = formatPhoneNumber(originalValue);

            // Update the input value only if it changed
            if (originalValue !== formattedValue) {
                // Включаем блокировку перед изменением
                isFormatting = true;

                // Get current cursor position
                let cursorPosition = inputElement.selectionStart || 0;
                const digitsBeforeCursor = originalValue.slice(0, cursorPosition).replace(/\D/g, '').length;

                // Set the formatted value
                inputElement.value = formattedValue;

                // Calculate new cursor position
                let newCursorPosition = 0;
                let digitsCounted = 0;
                for (let i = 0; i < formattedValue.length && digitsCounted < digitsBeforeCursor; i++) {
                    newCursorPosition = i + 1;
                    if (/\d/.test(formattedValue[i])) {
                        digitsCounted++;
                    }
                }

                // Adjust cursor logic
                if (formattedValue.length < originalValue.length && cursorPosition > 0 && !/\d/.test(originalValue[cursorPosition-1])) {
                    newCursorPosition = Math.max(0, newCursorPosition - 1);
                } else if (formattedValue.length > originalValue.length && /\d/.test(originalValue[cursorPosition-1]) && !/\d/.test(formattedValue[cursorPosition])) {
                    newCursorPosition = Math.max(0, newCursorPosition + 1);
                }

                inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

                // Отправляем событие для обновления v-model
                el.dispatchEvent(new Event('input', { bubbles: true }));

                // Снимаем блокировку после обработки
                isFormatting = false;
            }
        };

        el.__phoneFormatHandler__ = handleInput;
        el.addEventListener('input', handleInput);

        // Initial formatting
        if (el.value) {
            // Для первоначального вызова эмулируем событие, но не диспатчим новое
            const formatted = formatPhoneNumber(el.value);
            if (el.value !== formatted) {
                el.value = formatted;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    },
    unmounted(el) {
        if (el.__phoneFormatHandler__) {
            el.removeEventListener('input', el.__phoneFormatHandler__);
            delete el.__phoneFormatHandler__;
        }
    }
};