import React from 'react';
import { Link } from 'react-router-dom';
import { type Booking } from './services/api';

type Props = {
    booking: Booking;
};

function BookingSuccess({ booking }: Props) {
    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }} data-testid="booking-success">
            <h1 className="fw-bold mb-4 fs-1">Бронирование оформлено</h1>

            <p className="fs-6 mb-4">
                Код бронирования: <span data-testid="booking-code"><strong>{booking.code}</strong></span>
            </p>

            <p className="fs-6 mb-4">
                {booking.flight.origin.name} → {booking.flight.destination.name}, {booking.flight.flightNumber}
            </p>

            <p className="fs-6 mb-4">
                Пассажиров: {booking.passengers.length}
            </p>

            <p className="fs-6 mb-4">
                Итого: {booking.totalPrice.amount} {booking.totalPrice.currency === 'RUB' ? '₽' : booking.totalPrice.currency}
            </p>

            <div className="mt-5">
                <Link to="/" className="btn btn-primary">Вернуться к поиску</Link>
            </div>
        </div>
    );
}

export default BookingSuccess;