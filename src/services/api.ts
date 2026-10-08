import axios from 'axios';

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

export default api;