import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchForm from './SearchForm';
import BookingPage from './BookingPage';

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <div>
                        <h1 data-testid="main-heading">
                            Добро пожаловать в систему бронирования!
                        </h1>
                        <SearchForm />
                    </div>
                }
            />
            <Route path="/booking/:flightId" element={<BookingPage />} />
        </Routes>
    );
}

export default App;