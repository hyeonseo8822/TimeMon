import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/BottomBar.css';

const BottomBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', defaultImg: '/img/home.svg', activeImg: '/img/homeFill.svg' },
        { path: '/timer', defaultImg: '/img/bar_clock.svg', activeImg: '/img/ClockFill.svg' },
        { path: '/inventory', defaultImg: '/img/bar_inventory.svg', activeImg: '/img/inventotyFill.svg' },
        { path: '/profile', defaultImg: '/img/Person.svg', activeImg: '/img/PersonFill.svg' },
    ];

    return (
        <div className="bottom-bar">
            {navItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="nav-button"
                >
                    <img
                        src={
                            (location.pathname === item.path || (item.path === '/app' && location.pathname === '/'))
                                ? item.activeImg
                                : item.defaultImg
                        }
                        alt=""
                        className="nav-icon"
                    />
                </button>
            ))}
        </div>
    );
};

export default BottomBar;
