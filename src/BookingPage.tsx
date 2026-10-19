import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFlightById, createBooking, Booking } from './services/api';
import BookingSuccess from './BookingSuccess';

function BookingPage() {
    const { flightId } = useParams();

    const [flight, setFlight] = useState(null);
    const [bookingResult, setBookingResult] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [flightNotFound, setFlightNotFound] = useState(false);
    const [contact, setContact] = useState({
        email: 'ivan@example.com',
        phone: '+7 999 000-11-22',
    });

    const [passengers, setPassengers] = useState([
        {
            id: 1,
            firstName: 'Иван',
            lastName: 'Петров',
            dateOfBirth: '',
            documentNumber: '4509 123456',
        },
    ]);

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContact((prev) => ({ ...prev, [name]: value }));
    };

    const handlePassengerChange = (id, field, value) => {
        setPassengers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleAddPassenger = () => {
        setPassengers((prev) => [
            ...prev,
            {
                id: Date.now(),
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                documentNumber: '',
            },
        ]);
    };

    const fetchFlight = async () => {
        if (!flightId) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await getFlightById(flightId);
            setFlight(data);
        } catch (err) {
            setFlightNotFound(true);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        console.log(passengers);

        if (!contact.email.trim() || !contact.phone.trim()) {
            setError('Пожалуйста, заполните email и телефон.');
            return;
        }

        for (const p of passengers) {
            if (!p.firstName.trim() || !p.lastName.trim() || !p.dateOfBirth || !p.documentNumber.trim()) {
                setError('Пожалуйста, заполните все данные пассажиров.');
                return;
            }
        }

        setIsLoading(true);
        try {
            const contactInfo = { email: contact.email, phone: contact.phone }
            const response = await createBooking({ flightId: flightId!, contact: contactInfo, passengers });
            setBookingResult(response);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Ошибка при создании брони.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFlight();
    }, [flightId]);

    if (flightNotFound) {
        return (
            <div className="alert alert-danger mb-4" role="alert">
                <p className="mb-0" data-testid="flight-not-found">Рейс не найден</p>
            </div>
        )
    }

    if (bookingResult) {
        return <BookingSuccess booking={bookingResult} />;
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    <p className="mb-0" data-testid="booking-error">{error}</p>
                </div>
            )}

            <h1 className="fw-bold mb-4 fs-1">Оформление бронирования</h1>

            <p className="fs-5 mb-4">
                {flight?.airline.name} · <span data-testid="booking-flight">{flight?.flightNumber}</span>: {flight?.origin.name} → {flight?.destination.name}
            </p>

            <form onSubmit={handleSubmit} data-testid="booking-form">
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-bold small">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={contact.email}
                            onChange={handleContactChange}
                            data-testid="contact-email"
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-bold small">
                            Телефон
                        </label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={contact.phone}
                            onChange={handleContactChange}
                            data-testid="contact-phone"
                        />
                    </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                    <hr className="flex-grow-1 m-0 text-secondary opacity-25" />
                    <span className="px-3 text-secondary small">Пассажиры</span>
                    <hr className="flex-grow-1 m-0 text-secondary opacity-25" />
                </div>

                {passengers.map((passenger, index) => (
                    <div key={passenger.id} className="card mb-4 border rounded-3 shadow-sm">
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label fw-bold small">Имя</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={passenger.firstName}
                                        onChange={(e) =>
                                            handlePassengerChange(passenger.id, 'firstName', e.target.value)
                                        }
                                        data-testid={`passenger-${index}-firstName`}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-bold small">Фамилия</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={passenger.lastName}
                                        onChange={(e) =>
                                            handlePassengerChange(passenger.id, 'lastName', e.target.value)
                                        }
                                        data-testid={`passenger-${index}-lastName`}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-bold small">Дата рождения</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={passenger.dateOfBirth}
                                        onChange={(e) =>
                                            handlePassengerChange(passenger.id, 'dateOfBirth', e.target.value)
                                        }
                                        data-testid={`passenger-${index}-dob`}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-bold small">Документ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={passenger.documentNumber}
                                        onChange={(e) =>
                                            handlePassengerChange(passenger.id, 'documentNumber', e.target.value)
                                        }
                                        data-testid={`passenger-${index}-document`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="d-flex gap-3 mt-4">
                    <button
                        type="button"
                        className="btn text-primary bg-primary bg-opacity-25 fw-semibold px-4 py-2 border-0"
                        onClick={handleAddPassenger}
                        data-test-id="add-passenger"
                    >
                        Добавить пассажира
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary fw-semibold px-4 py-2"
                        data-testid="booking-submit"
                    >
                        Забронировать
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookingPage;