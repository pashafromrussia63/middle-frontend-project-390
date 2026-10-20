import axios from 'axios';

export type Money = {
    amount: number;
    currency: string;
};

export type Airline = {
    code: string;
    name: string;
};

export type City = {
    code: string;
    name: string;
    country?: string;
};


export type Flight = {
    id: string;
    flightNumber: string;
    airline: Airline;
    origin: City;
    destination: City;
    departureAt: string;
    arrivalAt: string;
    durationMinutes: number;
    price: Money;
    seatsAvailable: number;
};

export type PassengerPayload = {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documentNumber: string;
};

export type ContactPayload = {
    email: string;
    phone: string;
};

export type CreateBookingRequest = {
    flightId: string;
    contact: ContactPayload;
    passengers: PassengerPayload[];
};

export type Booking = {
    code: string;
    status: 'confirmed' | 'cancelled';
    flight: Flight;
    passengers: PassengerPayload[];
    contact: ContactPayload;
    totalPrice: Money;
    createdAt: string;
};

const api = axios.create({
    baseURL: 'http://localhost:4010',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getCities = async () => {
    try {
        const response = await api.get('/api/cities');
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
        throw error;
    }
};

export const getFlights = async (flightParams) => {
    try {
        const response = await api.get('/api/flights', {
            params: flightParams,
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке рейсов:', error);
        throw error;
    }
};

export const getFlightById = async (id: string): Promise<Flight> => {
    const response = await api.get<Flight>(`/api/flights/${id}`);
    return response.data;
};

export const createBooking = async (payload: CreateBookingRequest): Promise<Booking> => {
    const serverPayload = {
        flightId: payload.flightId,
        contact: payload.contact,
        passengers: payload.passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
            documentNumber: p.documentNumber,
        })),
    };

    const response = await api.post<Booking>('/api/bookings', serverPayload);
    return response.data;
};

export const getBookingByCode = async (code: string, lastName: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/api/bookings/${code}`, {
        params: { lastName }
    });
    return response.data;
};

export const cancelBooking = async (code: string, lastName: string): Promise<Booking> => {
    const response = await api.post<Booking>(`/api/bookings/${code}/cancel`, {
        lastName
    });
    return response.data;
};

export default api;