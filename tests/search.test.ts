import { test, expect } from '@playwright/test';

test('Начальное состояние страницы поиска', async ({ page }) => {
    await page.goto('/');

    await page.route('**/api/flights*', async (route) => {
        const mockFlights = [
            { id: 'fl_1', flightNumber: 'DP1001', airline: { name: 'Победа' }, origin: { name: 'Москва' }, destination: { name: 'СПБ' }, departureAt: '...', price: { amount: 1000, currency: 'RUB' } },
        ];
        
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockFlights),
        });
    });

    await page.route('**/api/cities', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ code: 'MOW', name: 'Москва' }, { code: 'LED', name: 'СПБ' }]),
        });
    });
    
    const searchForm = page.getByTestId('flight-search-form');
    const searchResults = page.getByTestId('flight-results');
    const flightItems = page.getByTestId('flight-result-item');
    
    await expect(searchForm).toBeVisible();
    await expect(searchResults).toBeVisible();
    await expect(flightItems).toHaveCount(1);
});

test('Рейсы не найдены', async ({ page }) => {
    await page.goto('/');

    await page.route('**/api/flights*', async (route) => {
        const mockFlights = [];
        
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockFlights),
        });
    });

    const searchResults = page.getByTestId('flight-results');
    const flightsEmpty = page.getByTestId('flights-empty');
    
    await expect(searchResults).toBeHidden(); 
    await expect(flightsEmpty).toBeVisible();
});

test('Ошибка поиска', async ({ page }) => {
    await page.goto('/');

    await page.route('**/api/flights*', async (route) => {
        await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
                code: 'validation_error',
                message: 'Некорректные параметры запроса'
            }),
        });
    });

    const searchResults = page.getByTestId('flight-results');
    const flightsError = page.getByTestId('flights-error');
    
    await expect(searchResults).toBeHidden(); 
    await expect(flightsError).toBeVisible();
});

test('Отправка запроса с измененным параметром', async ({ page }) => {
    await page.route('**/api/cities', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ code: 'MOW', name: 'Москва' }, { code: 'LED', name: 'СПБ' }]),
        });
    });

    await page.goto('/');

    const searchOrigin = page.getByTestId('search-origin');
    const searchDestination = page.getByTestId('search-destination');
    const submitButton = page.getByTestId('search-submit');

    await searchOrigin.selectOption('LED');
    await searchDestination.selectOption('MOW');

    const requestPromise = page.waitForRequest(
        request => request.url().includes('/api/flights')
    );

    await submitButton.click();

    const request = await requestPromise;
    expect(request.url()).toContain('origin=LED');
    expect(request.url()).toContain('destination=MOW');
});

test('Нажатие на кнопку бронирования', async ({ page }) => {
    await page.goto('/');

    await page.route('**/api/flights*', async (route) => {
        const mockFlights = [
            { id: 'fl_1', flightNumber: 'DP1001', airline: { name: 'Победа' }, origin: { name: 'Москва' }, destination: { name: 'СПБ' }, departureAt: '...', price: { amount: 1000, currency: 'RUB' } },
        ];
        
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockFlights),
        });
    });

    const bookFlightButton = page.getByTestId('book-flight').first();
    await expect(bookFlightButton).toHaveJSProperty('tagName', 'A');
    await expect(bookFlightButton).toHaveAttribute('href', '/booking/fl_1');

    await bookFlightButton.click();

    await expect(page).toHaveURL(/\/booking\/fl_1/);
});