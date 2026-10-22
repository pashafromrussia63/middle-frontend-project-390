import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import SearchForm from './SearchForm';
import BookingPage from './BookingPage';
import LookupPage from './LookupPage';

function App() {
    return (
        <div className="container py-4" style={{ maxWidth: '1000px' }}>
            <header className="mb-1">
                <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }} data-testid="main-heading">
                    Бронирование авиабилетов
                </h1>
                
                <nav className="nav fs-5">
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            `nav-link px-0 me-4 ${isActive ? 'text-primary' : 'text-secondary'}`
                        }
                    >
                        Поиск рейсов
                    </NavLink>
                    
                    <NavLink 
                        to="/lookup" 
                        className={({ isActive }) => 
                            `nav-link px-0 ${isActive ? 'text-primary' : 'text-secondary'}`
                        }
                        data-testid="nav-lookup"
                    >
                        Мои брони
                    </NavLink>
                </nav>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<SearchForm />} />
                    <Route path="/booking/:flightId" element={<BookingPage />} />
                    <Route path="/lookup" element={<LookupPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;