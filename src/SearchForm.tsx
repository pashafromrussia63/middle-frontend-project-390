import React, { useState, useEffect } from 'react';
import { getCities, getFlights } from './services/api';
import Flights from './Flights';

type SearchParams = {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
};

function SearchForm() {
    const [form, setForm] = useState<SearchParams>({
        origin: '',
        destination: '',
        date: '',
        passengers: 1,
    });
    const [cities, setCities] = useState([]);
    const [flights, setFlights] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'passengers' ? Number(value) : value,
        }));
    };

    const loadFlights = async (searchParams: SearchParams) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const flightsData = await getFlights(searchParams);
            setFlights(flightsData ?? []);
        } catch (err) {
            console.error('Ошибка загрузки рейсов:', err);
            setError('Не удалось загрузить рейсы. Попробуйте позже.');
            setFlights([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        loadFlights(form);
    };

    const loadCities = async () => {
        try {
            const citiesData = await getCities();
            setCities(citiesData);
            const initialSearchParams: SearchParams = {
                ...form,
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                origin: citiesData[0]?.code ?? '',
                destination: citiesData[1]?.code ?? '',
            };
            setForm(initialSearchParams);
            loadFlights(initialSearchParams);
        } catch (err) {
            console.error('Ошибка загрузки городов:', err);
            setError('Не удалось загрузить список городов.');
        }
    };

    useEffect(() => {
        loadCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <form
                className="row g-3 p-4 border rounded shadow-sm bg-light"
                onSubmit={handleSearchSubmit}
                data-testid="flight-search-form"
            >
                <div className="col-md-3">
                    <label htmlFor="origin" className="form-label fw-semibold">Откуда</label>
                    <select
                        id="origin"
                        className="form-select"
                        name="origin"
                        value={form.origin}
                        onChange={handleChange}
                        data-testid="search-origin"
                        required
                    >
                        {cities.map((city) => (
                            <option key={city.code} value={city.code}>{city.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label htmlFor="destination" className="form-label fw-semibold">Куда</label>
                    <select
                        id="destination"
                        className="form-select"
                        name="destination"
                        value={form.destination}
                        onChange={handleChange}
                        data-testid="search-destination"
                        required
                    >
                        {cities.map((city) => (
                            <option key={city.code} value={city.code}>{city.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <label htmlFor="date" className="form-label fw-semibold">Дата вылета</label>
                    <input
                        id="date"
                        type="date"
                        className="form-control"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        data-testid="search-date"
                        required
                    />
                </div>

                <div className="col-md-2">
                    <label htmlFor="passengers" className="form-label fw-semibold">Пассажиры</label>
                    <input
                        id="passengers"
                        type="number"
                        className="form-control"
                        name="passengers"
                        min="1"
                        max="10"
                        value={form.passengers}
                        onChange={handleChange}
                        data-testid="search-passengers"
                        required
                    />
                </div>

                <div className="col-md-2 d-flex align-items-end">
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        data-testid="search-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Поиск…' : 'Найти'}
                    </button>
                </div>
            </form>

            {isLoading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            )}

            {!isLoading && error && (
                <div
                    className="alert alert-danger mt-4"
                    role="alert"
                    data-testid="flights-error"
                >
                    {error}
                </div>
            )}

            {!isLoading && !error && hasSearched && flights.length === 0 && (
                <div
                    className="alert alert-warning mt-4"
                    role="alert"
                    data-testid="flights-empty"
                >
                    По вашему запросу рейсы не найдены.
                </div>
            )}

            {!isLoading && !error && flights.length > 0 && (
                <div data-testid="flight-results">
                    <Flights flights={flights} />
                </div>
            )}
        </div>
    );
}

export default SearchForm;