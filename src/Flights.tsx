import React from 'react';
import { Link } from 'react-router-dom';

function Flights({ flights }) {
    return (
        <div>
            {flights.map((flight) => (
                <div
                    key={flight.id}
                    className="card mb-3 shadow-sm border rounded-3"
                    data-testid="flight-result-item"
                >
                    <div className="card-body d-flex justify-content-between align-items-center p-4">
                        <div>
                            <h5 className="card-title fw-bold mb-1">
                                {flight.airline.name} · {flight.flightNumber}
                            </h5>

                            <h6 className="card-subtitle mb-2 text-dark">
                                {flight.origin.name} → {flight.destination.name}
                            </h6>

                            <p className="card-text text-muted small mb-0">
                                {new Date(flight.departureAt).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                {' — '}
                                {new Date(flight.arrivalAt).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                {' · '}
                                {Math.floor(
                                    (new Date(flight.arrivalAt) - new Date(flight.departureAt)) / 60000
                                )}{' '}
                                мин
                            </p>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            <span className="fw-bold fs-5">
                                {flight.price.amount} {flight.price.currency}
                            </span>
                            <Link
                                to={`/booking/${flight.id}`}
                                className="btn btn-primary px-4 py-2"
                                style={{
                                    backgroundColor: '#cce5ff',
                                    color: '#004085',
                                    border: 'none',
                                }}
                                data-testid="book-flight"
                            >
                                Забронировать
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Flights;