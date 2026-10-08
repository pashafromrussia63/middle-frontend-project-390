import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getFlightById,
    createBooking,
    type Flight,
    type Passenger,
} from './services/api';

type Contact = { email: string; phone: string };

type FieldErrors = {
    email?: string;
    phone?: string;
    passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
};

const emptyPassenger = (): Passenger => ({
    firstName: '',
    lastName: '',
    birthDate: '',
    document: '',
});

function BookingPage() {
    const { flightId = '' } = useParams();

    const [flight, setFlight] = useState<Flight | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [contact, setContact] = useState<Contact>({ email: '', phone: '' });
    const [passengers, setPassengers] = useState<Passenger[]>([emptyPassenger()]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [bookingCode, setBookingCode] = useState<string | null>(null);

    const [errors, setErrors] = useState<FieldErrors>({});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await getFlightById(flightId);
                if (!cancelled) setFlight(data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setLoadError('Не удалось загрузить рейс.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [flightId]);

    const handleContact = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContact((prev) => ({ ...prev, [name]: value }));
    };

    const handlePassenger = (
        index: number,
        field: keyof Passenger,
        value: string
    ) => {
        setPassengers((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    };

    const addPassenger = () => {
        setPassengers((prev) => [...prev, emptyPassenger()]);
    };

    const validate = (): boolean => {
        const next: FieldErrors = {};

        if (!contact.email.trim()) {
            next.email = 'Укажите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            next.email = 'Некорректный email';
        }

        if (!contact.phone.trim()) {
            next.phone = 'Укажите телефон';
        }

        const passengerErrors: FieldErrors['passengers'] = {};
        passengers.forEach((p, i) => {
            const pe: Partial<Record<keyof Passenger, string>> = {};
            if (!p.firstName.trim()) pe.firstName = 'Укажите имя';
            if (!p.lastName.trim()) pe.lastName = 'Укажите фамилию';
            if (!p.birthDate) pe.birthDate = 'Укажите дату рождения';
            if (!p.document.trim()) pe.document = 'Укажите документ';
            if (Object.keys(pe).length) passengerErrors[i] = pe;
        });
        if (Object.keys(passengerErrors).length) {
            next.passengers = passengerErrors;
        }

        setErrors(next);
        return (
            !next.email &&
            !next.phone &&
            !next.passengers
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await createBooking({
                flightId,
                contact,
                passengers,
            });
            setBookingCode(response.code);
        } catch (err: any) {
            console.error(err);
            const serverErrors = err?.response?.data?.errors as
                | FieldErrors
                | undefined;
            if (serverErrors) {
                setErrors(serverErrors);
                setSubmitError('Проверьте правильность заполнения полей.');
            } else {
                setSubmitError(
                    err?.response?.data?.message ||
                        'Не удалось создать бронь. Попробуйте позже.'
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-5" data-testid="booking-loading">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="container py-5">
                <div
                    className="alert alert-danger"
                    role="alert"
                    data-testid="booking-load-error"
                >
                    {loadError}
                </div>
                <Link to="/" className="btn btn-link">
                    ← Назад к поиску
                </Link>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="container py-5">
                <div
                    className="alert alert-warning"
                    role="alert"
                    data-testid="booking-not-found"
                >
                    Рейс не найден.
                </div>
                <Link to="/" className="btn btn-link">
                    ← Назад к поиску
                </Link>
            </div>
        );
    }

    if (bookingCode) {
        return (
            <div className="container py-5" style={{ maxWidth: '700px' }}>
                <div
                    className="alert alert-success"
                    role="alert"
                    data-testid="booking-success"
                >
                    <h2 className="h4 mb-3">Бронь оформлена!</h2>
                    <p className="mb-2">Ваш код бронирования:</p>
                    <p
                        className="fs-3 fw-bold mb-3"
                        data-testid="booking-success-code"
                    >
                        {bookingCode}
                    </p>
                    <Link to="/" className="btn btn-primary">
                        Вернуться к поиску
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
            <h1 className="fw-bold mb-4" data-testid="booking-heading">
                Оформление бронирования
            </h1>

            <p className="fs-5 mb-4" data-testid="booking-flight-info">
                {flight.airline.name} · {flight.flightNumber}: {flight.origin.name} →{' '}
                {flight.destination.name}
            </p>

            <form onSubmit={handleSubmit} noValidate data-testid="booking-form">
                {/* Контакты */}
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-bold">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={`form-control ${
                                errors.email ? 'is-invalid' : ''
                            }`}
                            value={contact.email}
                            onChange={handleContact}
                            data-testid="booking-email"
                        />
                        {errors.email && (
                            <div
                                className="invalid-feedback"
                                data-testid="booking-email-error"
                            >
                                {errors.email}
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="phone" className="form-label fw-bold">
                            Телефон
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className={`form-control ${
                                errors.phone ? 'is-invalid' : ''
                            }`}
                            value={contact.phone}
                            onChange={handleContact}
                            data-testid="booking-phone"
                        />
                        {errors.phone && (
                            <div
                                className="invalid-feedback"
                                data-testid="booking-phone-error"
                            >
                                {errors.phone}
                            </div>
                        )}
                    </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                    <hr className="flex-grow-1 m-0 text-muted" />
                    <span className="px-3 text-muted small">Пассажиры</span>
                    <hr className="flex-grow-1 m-0 text-muted" />
                </div>

                {/* Пассажиры */}
                {passengers.map((p, i) => {
                    const pe = errors.passengers?.[i] ?? {};
                    return (
                        <div
                            key={i}
                            className="card mb-4 border rounded-3 shadow-sm"
                            data-testid="passenger-card"
                        >
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">
                                            Имя
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                pe.firstName ? 'is-invalid' : ''
                                            }`}
                                            value={p.firstName}
                                            onChange={(e) =>
                                                handlePassenger(
                                                    i,
                                                    'firstName',
                                                    e.target.value
                                                )
                                            }
                                            data-testid="passenger-first-name"
                                        />
                                        {pe.firstName && (
                                            <div
                                                className="invalid-feedback"
                                                data-testid="passenger-first-name-error"
                                            >
                                                {pe.firstName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">
                                            Фамилия
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                pe.lastName ? 'is-invalid' : ''
                                            }`}
                                            value={p.lastName}
                                            onChange={(e) =>
                                                handlePassenger(
                                                    i,
                                                    'lastName',
                                                    e.target.value
                                                )
                                            }
                                            data-testid="passenger-last-name"
                                        />
                                        {pe.lastName && (
                                            <div
                                                className="invalid-feedback"
                                                data-testid="passenger-last-name-error"
                                            >
                                                {pe.lastName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">
                                            Дата рождения
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${
                                                pe.birthDate ? 'is-invalid' : ''
                                            }`}
                                            value={p.birthDate}
                                            onChange={(e) =>
                                                handlePassenger(
                                                    i,
                                                    'birthDate',
                                                    e.target.value
                                                )
                                            }
                                            data-testid="passenger-birth-date"
                                        />
                                        {pe.birthDate && (
                                            <div
                                                className="invalid-feedback"
                                                data-testid="passenger-birth-date-error"
                                            >
                                                {pe.birthDate}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">
                                            Документ
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                pe.document ? 'is-invalid' : ''
                                            }`}
                                            value={p.document}
                                            onChange={(e) =>
                                                handlePassenger(
                                                    i,
                                                    'document',
                                                    e.target.value
                                                )
                                            }
                                            data-testid="passenger-document"
                                        />
                                        {pe.document && (
                                            <div
                                                className="invalid-feedback"
                                                data-testid="passenger-document-error"
                                            >
                                                {pe.document}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {submitError && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        data-testid="booking-submit-error"
                    >
                        {submitError}
                    </div>
                )}

                <div className="d-flex gap-3 mt-4">
                    <button
                        type="button"
                        className="btn px-4 py-2 fw-semibold"
                        style={{
                            backgroundColor: '#cce5ff',
                            color: '#004085',
                            border: 'none',
                        }}
                        onClick={addPassenger}
                        data-testid="add-passenger"
                    >
                        Добавить пассажира
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary px-4 py-2 fw-semibold"
                        disabled={isSubmitting}
                        data-testid="confirm-booking"
                    >
                        {isSubmitting ? 'Отправляем…' : 'Забронировать'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookingPage;