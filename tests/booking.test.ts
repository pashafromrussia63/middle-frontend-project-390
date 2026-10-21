import { test, expect } from '@playwright/test';

const mockFlight = { 
    id: 'fl_1', flightNumber: 'DP1001', airline: { name: 'Победа' }, origin: { name: 'Москва' }, destination: { name: 'СПБ' }, departureAt: '...', price: { amount: 1000, currency: 'RUB' } 
};

async function fillBookingForm(page) {
    await page.getByTestId('contact-email').fill('test@test.com');
    await page.getByTestId('contact-phone').fill('123456789');
    
    await page.getByTestId('passenger-0-firstName').fill('Иван');
    await page.getByTestId('passenger-0-lastName').fill('Петров');
    await page.getByTestId('passenger-0-dob').fill('1990-01-01');
    await page.getByTestId('passenger-0-document').fill('1234567890');
}

test.beforeEach(async ({ page }) => {
    await page.route('**/api/flights/fl_1', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockFlight),
        });
    });
    
    await page.goto('/booking/fl_1');
    await expect(page.getByTestId('booking-form')).toBeVisible();
});

test('Начальное состояние страницы бронирования', async ({ page }) => {
    const bookingForm = page.getByTestId('booking-form');
    const bookingFlight = page.getByTestId('booking-flight');
    
    await expect(bookingForm).toBeVisible();
    await expect(bookingFlight).toHaveText(mockFlight.flightNumber);
});

test('Рейс не найден', async ({ page }) => {
    await page.route('**/api/flights/*', async (route) => {
        await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
                code: 'flight_not_found_error',
                message: 'Рейс не найден'
            }),
        });
    });

    await page.goto('/booking/fl_1');

    const bookingFlight = page.getByTestId('booking-flight');
    const notFoundError = page.getByTestId('flight-not-found');
    
    await expect(bookingFlight).toBeHidden();
    await expect(notFoundError).toBeVisible();
});

test('Отправка пустой формы', async ({ page }) => {
    const submitButton = page.getByTestId('booking-submit');
    const bookingError = page.getByTestId('booking-error');

    await submitButton.click();

    await expect(bookingError).toBeVisible();
});

test('Добавление пассажира', async ({ page }) => {
    const passenger0 = page.getByTestId('passenger-0-firstName');
    const passenger1 = page.getByTestId('passenger-1-firstName');
    await expect(passenger0).toBeVisible();
    await expect(passenger1).toBeHidden();

    const addPassengerButton = page.getByTestId('add-passenger');
    await addPassengerButton.click();

    await expect(passenger1).toBeVisible();
});

test('Успешное оформление брони показывает код', async ({ page }) => {
    await page.route('**/api/bookings', async (route) => {
        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
                code: 'ABC123',
                status: 'confirmed',
                flight: {
                    id: 'fl_1',
                    flightNumber: 'DP1001',
                    airline: { name: 'Победа' },
                    origin: { name: 'Москва' },
                    destination: { name: 'СПБ' }
                },
                passengers: [
                    { firstName: 'Иван', lastName: 'Петров', dateOfBirth: '1990-01-01', documentNumber: '1234567890' }
                ],
                totalPrice: { amount: 6000, currency: 'RUB' }
            }),
        });
    });

    await fillBookingForm(page);

    const submitButton = page.getByTestId('booking-submit');
    await submitButton.click();

    const successPanel = page.getByTestId('booking-success');
    await expect(successPanel).toBeVisible();

    const bookingCode = page.getByTestId('booking-code');
    await expect(bookingCode).toHaveText('ABC123');
});

test('Ошибка сервера отображается на форме', async ({ page }) => {
    await page.route('**/api/bookings', async (route) => {
        await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
                message: 'Ошибка сервера',
            }),
        });
    });

    await fillBookingForm(page);

    const submitButton = page.getByTestId('booking-submit');
    await submitButton.click();

    const bookingForm = page.getByTestId('booking-form');
    const bookingError = page.getByTestId('booking-error');
    
    await expect(bookingForm).toBeVisible();
    await expect(bookingError).toBeVisible();
});