import { test, expect, Page } from '@playwright/test';

const mockBooking = {
    code: 'ABC123',
    status: 'confirmed',
    flight: {
        id: 'fl_1',
        flightNumber: 'DP1001',
        airline: { name: 'Победа' },
        origin: { name: 'Москва' },
        destination: { name: 'СПБ' },
    },
    passengers: [{ firstName: 'Иван', lastName: 'Петров', dateOfBirth: '1990-01-01', documentNumber: '123456' }],
    totalPrice: { amount: 6000, currency: 'RUB' },
};

async function fillLookupForm(page: Page, code = 'ABC123', lastName = 'Петров') {
    const lookupCode = page.getByTestId('lookup-code');
    const lookupLastName = page.getByTestId('lookup-lastName');
    const lookupSubmit = page.getByTestId('lookup-submit');

    await lookupCode.fill(code);
    await lookupLastName.fill(lastName);
    await lookupSubmit.click();
}

test.describe('Страница "Мои брони" (/lookup)', () => {

    test('Навигация на страницу "Мои брони"', async ({ page }) => {
        await page.goto('/');
        
        const navLookup = page.getByTestId('nav-lookup');
        await navLookup.click();

        await expect(page).toHaveURL(/\/lookup/);
        
        const lookupForm = page.getByTestId('booking-lookup-form');
        await expect(lookupForm).toBeVisible();
    });

    test('Успешный поиск брони отображает карточку', async ({ page }) => {
        await page.route('**/api/bookings/ABC123*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooking),
            });
        });

        await page.goto('/lookup');
        await fillLookupForm(page);

        const bookingDetails = page.getByTestId('booking-details');
        const bookingCode = page.getByTestId('booking-code');
        const bookingStatus = page.getByTestId('booking-status');

        await expect(bookingDetails).toBeVisible();
        await expect(bookingCode).toHaveText('ABC123');
        await expect(bookingStatus).toHaveText('Подтверждена');
    });

    test('Бронь не найдена показывает ошибку', async ({ page }) => {
        await page.route('**/api/bookings/ABC123*', async (route) => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Not found' }),
            });
        });

        await page.goto('/lookup');
        await fillLookupForm(page);

        const notFoundMessage = page.getByTestId('booking-not-found');
        const bookingDetails = page.getByTestId('booking-details');

        await expect(notFoundMessage).toBeVisible();
        await expect(bookingDetails).toBeHidden();
    });

    // test('Отмена брони меняет статус на cancelled', async ({ page }) => {
    //     await page.route('**/api/bookings/ABC123*', async (route) => {
    //         if (route.request().method() === 'POST') {
    //             await route.fulfill({
    //                 status: 200,
    //                 contentType: 'application/json',
    //                 body: JSON.stringify({ ...mockBooking, status: 'cancelled' }),
    //             });
    //         } else {
    //             await route.fulfill({
    //                 status: 200,
    //                 contentType: 'application/json',
    //                 body: JSON.stringify(mockBooking),
    //             });
    //         }
    //     });

    //     await page.goto('/lookup');
    //     await fillLookupForm(page);

    //     const bookingStatus = page.getByTestId('booking-status');
    //     const cancelButton = page.getByTestId('cancel-booking');

    //     await expect(bookingStatus).toHaveText('Подтверждена');
        
    //     await cancelButton.click();

    //     await expect(bookingStatus).toHaveText('Отменена');
    //     await expect(cancelButton).toBeHidden();
    // });
});