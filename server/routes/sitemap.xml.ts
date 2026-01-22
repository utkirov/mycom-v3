import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Конфигурация
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase
    const baseUrl = 'https://mycom.uz'

    // Список языков (можно вынести в конфиг, но для sitemap надежнее так)
    const locales = ['', '/ru', '/en'] // '' = uz (default)

    // 2. Статические маршруты
    const staticRoutes = [
        '', // Главная
        '/about',
        '/contacts',
        '/delivery',
        '/terms',
        '/trade-in',
        '/warranty'
    ]

    // 3. Получение динамических данных (Категории/Коллекции)
    let dynamicRoutes: string[] = []

    try {
        // Запрашиваем коллекции (категории) с бэкенда
        // Используем 'uz', так как слаги обычно одинаковые, или можно запрашивать для каждого языка
        const response: any = await $fetch(`${apiBase}/api/v1/site/collections`, {
            query: { lang: 'uz' }
        })

        const collections = Array.isArray(response.data) ? response.data : []

        // Формируем ссылки на каталог
        collections.forEach((col: any) => {
            if (col.slug || col.category_id) {
                // Формат ссылки как в компонентах: slug_id
                const slug = col.slug || 'category'
                dynamicRoutes.push(`/catalog/${slug}_${col.category_id}`)
            }
        })

    } catch (e) {
        console.error('Sitemap fetch error:', e)
    }

    // 4. Генерация XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'

    // Функция добавления URL
    const addUrl = (path: string, priority: string = '0.8', changefreq: string = 'daily') => {
        // Генерируем для каждого языка
        locales.forEach(localePrefix => {
            const fullUrl = `${baseUrl}${localePrefix}${path}`.replace(/\/$/, '') // Убираем trailing slash если есть

            sitemap += '<url>'
            sitemap += `<loc>${fullUrl}</loc>`
            sitemap += `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`
            sitemap += `<changefreq>${changefreq}</changefreq>`
            sitemap += `<priority>${path === '' ? '1.0' : priority}</priority>`
            sitemap += '</url>'
        })
    }

    // Добавляем статику
    staticRoutes.forEach(route => addUrl(route, '0.9', 'monthly'))

    // Добавляем динамику (Категории)
    dynamicRoutes.forEach(route => addUrl(route, '0.8', 'weekly'))

    sitemap += '</urlset>'

    // 5. Отдача ответа
    setHeader(event, 'Content-Type', 'application/xml')
    return sitemap
})