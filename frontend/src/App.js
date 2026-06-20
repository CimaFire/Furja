import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Pages
import Home from './pages/Home';
import StreamPage from './pages/StreamPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import GamesPage from './pages/GamesPage';
import AgenciesPage from './pages/AgenciesPage';
import CurrencyExchangePage from './pages/CurrencyExchangePage';

// Components
import Navigation from './components/Common/Navigation';
import Footer from './components/Common/Footer';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stream/:id" element={<StreamPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/agencies" element={<AgenciesPage />} />
            <Route path="/currency" element={<CurrencyExchangePage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
