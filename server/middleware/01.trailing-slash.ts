export default defineEventHandler((event) => {
    // Получаем текущий путь (включая query параметры, например: /delivery/?page=2)
    const path = event.path || ''

    // Разделяем путь и параметры запроса
    const [pathname, search] = path.split('?')

    // Если путь не является корнем '/' и заканчивается на '/'
    if (pathname !== '/' && pathname.endsWith('/')) {
        // Убираем последний символ (слэш)
        const newPathname = pathname.slice(0, -1)

        // Собираем новый URL (добавляем query параметры обратно, если они были)
        const newUrl = newPathname + (search ? `?${search}` : '')

        // Выполняем 301 редирект (Permanent Redirect)
        return sendRedirect(event, newUrl, 301)
    }
})