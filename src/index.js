import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './page/App';
import SignUp from './page/SignUp';
import Login from './page/Login'
import Timer from './page/Timer';
import Inventory from './page/Inventory';
import Profile from './page/Profile';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
