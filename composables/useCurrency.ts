// composables/useCurrency.ts

// Создаем инстанс форматера ОДИН РАЗ. Это очень эффективно.
const formatter = new Intl.NumberFormat('ru-RU', {
    // 'ru-RU' хорошо группирует числа (1 000 000)
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export const useCurrency = () => {

    /**
     * Форматирует число в красивую строку валюты.
     * @param value Сумма в виде числа
     * @returns Строка, например "1 234 500"
     */
    const format = (value: number | undefined | null): string => {
        if (typeof value !== 'number') {
            return '0';
        }
        return formatter.format(value);
    }

    return {
        format
    };
}