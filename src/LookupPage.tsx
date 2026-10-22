import React, { useState } from 'react';
import { getBookingByCode, cancelBooking } from './services/api';

type BookingStatus = 'confirmed' | 'cancelled';

interface BookingData {
    code: string;
    status: BookingStatus;
    flight: {
        airline: { name: string };
        flightNumber: string;
        origin: { name: string };
        destination: { name: string };
    };
    passengers: { firstName: string; lastName: string }[];
    totalPrice: { amount: number; currency: string };
}

function LookupPage() {
    const [code, setCode] = useState('');
    const [lastName, setLastName] = useState('');
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [bookingNotFoundError, setBookingNotFoundError] = useState(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingNotFoundError(null);
        setError(null);
        setBooking(null);
        setIsLoading(true);
        
        try {
            const data = await getBookingByCode(code.trim(), lastName.trim());
            setBooking(data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setBookingNotFoundError(true);
            } else {
                setError('Произошла ошибка при поиске. Попробуйте позже.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!booking) return;

        setIsLoading(true);
        setError(null);

        try {
            const updatedBooking = await cancelBooking(code.trim(), lastName.trim());
            setBooking(updatedBooking);
        } catch (err) {
            console.error(err);
            setError('Произошла ошибка при отмене брони. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="pt-2" style={{ maxWidth: '1000px' }}>
            <h2 className="fw-bold mb-4">Моя бронь</h2>

            <form onSubmit={handleSubmit} className="row g-3 align-items-end mb-4" data-testid="booking-lookup-form">
                <div className="col-md-4">
                    <label htmlFor="bookingCode" className="form-label fw-bold small">
                        Код брони
                    </label>
                    <input
                        type="text"
                        id="bookingCode"
                        className="form-control"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        data-testid="lookup-code"
                    />
                </div>
                <div className="col-md-4">
                    <label htmlFor="lastName" className="form-label fw-bold small">
                        Фамилия
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        className="form-control"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        data-testid="lookup-lastName"
                    />
                </div>
                <div className="col-md-4">
                    <button type="submit" className="btn btn-primary fw-semibold px-4 py-2 w-100" data-testid="lookup-submit">
                        Найти
                    </button>
                </div>
            </form>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {bookingNotFoundError && (
                <div className="alert alert-danger" role="alert" data-testid="booking-not-found">
                    {bookingNotFoundError}
                </div>
            )}

            {booking && (
                <div className="card mb-4 border rounded-3 shadow-sm" data-testid="booking-details">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <h5 className="fw-bold mb-0" data-testid="booking-code">{booking.code}</h5>
                            <span 
                                className={`badge rounded-pill text-uppercase px-3 py-2 ${
                                    booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                                }`}
                                data-testid="booking-status"
                            >
                                {booking.status === 'confirmed' ? 'Подтверждена' : 'Отменена'}
                            </span>
                        </div>

                        <p className="fs-6 mb-3">
                            {booking.flight.airline.name} · {booking.flight.flightNumber}: {booking.flight.origin.name} → {booking.flight.destination.name}
                        </p>

                        <p className="fs-6 mb-3">
                            Пассажиры: {booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                        </p>

                        <p className="fs-6 mb-4">
                            Итого: {booking.totalPrice.amount} {booking.totalPrice.currency}
                        </p>

                        {booking.status === 'confirmed' && (
                            <button 
                                type="button"
                                onClick={handleCancel}
                                className="btn w-100 fw-semibold py-2" 
                                style={{ backgroundColor: '#f8d7da', color: '#842029', border: 'none' }}
                                data-testid="cancel-booking"
                            >
                                Отменить бронь
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LookupPage;