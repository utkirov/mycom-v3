/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            backgroundImage: {
                'gradient-brand-blue': 'linear-gradient(90deg, #009FE3 0%, #00C0F0 100%)',
            },
            colors: {
                'brand-blue': '#009FE3',
                'brand-gray': '#647193',
                'brand-dark-blue': '#3F3E6E', // <-- Цвет заголовка
                'brand-red': '#E30031',     // <-- Цвет скидки
                'icon-bg': '#EFEFEF',       // <-- Фон иконок
                'section-title': '#556284',
                'footer-bg': 'rgba(85, 98, 132, 0.05)',
                'category-bg': 'rgba(100, 113, 147, 0.05)', // #647193 at 5%
                'category-bg-hover': 'rgba(100, 113, 147, 0.1)', // #647193 at 10%
                'spec-pill': 'rgba(100, 113, 147, 0.05)', // #647193 5%
                'spec-pill-hover': 'rgba(100, 113, 147, 0.1)', // #647193 10%
                'price-block-bg': 'rgba(0, 159, 227, 0.05)', // Предположение для фона цены
                'brand-green': '#22C55E',
            },
            fontFamily: {
                'unbounded': ['Unbounded', 'sans-serif'],
                'mulish': ['Mulish', 'sans-serif'], // Добавил, раз подключили в nuxt.config
            },
            screens: {
                'xs': '375px', // Добавляем экстра-малый экран
            },
        },

    },
    plugins: [],
}