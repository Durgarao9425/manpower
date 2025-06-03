import { Alert, alpha, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Modal, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import durgarao from '../../../Images/durgarao.jpeg';
import {
    SwipeRight as SwipeRightIcon,
    Close as CloseIcon,
    AccessTime as TimeIcon,

} from '@mui/icons-material';
import Attendance from './Attendance';
import { Orders } from './RiderOrdersPage';
import { Profile } from './RiderProfilePage';
import { Settings } from './RiderSettingsPage';
import { Certificate } from './RiderCertificatePage';
import { Dashboard } from './DashboardReusable';
import { useState } from "react";
import { InfoCard, TabPanel } from "./TablePannel";
import { ThemeProvider, useTheme } from '../../../context/ThemeContext';
// Logout Component
const Logout: React.FC<{ onNavigate: (pageIndex: number) => void }> = ({ onNavigate }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { themeColor } = useTheme();


    const handleLogout = () => {
        console.log('User logged out');
        setShowConfirmModal(false);
        setOpenSnackbar(true); // Show the toast
        navigate('/login');
    };


    return (
        <div style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '300px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                }}>
                    👋
                </div>

                <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#333',
                    fontSize: '20px'
                }}>
                    Ready to Logout?
                </h3>

                <p style={{
                    margin: '0 0 24px 0',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.4'
                }}>
                    You will be signed out of your account and redirected to the login page.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: themeColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${themeColor}dd`}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = themeColor}
                    >
                        Yes, Logout
                    </button>

                    <button
                        onClick={() => onNavigate(0)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
                    Logout successfully!
                </Alert>
            </Snackbar>


            {/* Quick Actions */}
            <div style={{
                marginTop: '32px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '300px'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    Before you go...
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div
                        onClick={() => onNavigate(5)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '18px' }}>👤</span>
                        <span style={{ fontSize: '14px', color: '#333' }}>Update Profile</span>
                    </div>

                    <div
                        onClick={() => onNavigate(6)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '18px' }}>⚙️</span>
                        <span style={{ fontSize: '14px', color: '#333' }}>Check Settings</span>
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1001,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '300px',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>

                            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                                Confirm Logout
                            </h4>

                            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
                                Are you sure you want to logout?
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: themeColor,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const More: React.FC<{ onNavigate: (pageIndex: number) => void }> = ({ onNavigate }) => {
    const moreMenuItems = [
        {
            icon: '📊',
            text: 'Dashboard',
            action: () => onNavigate(0)
        },
        {
            icon: '👤',
            text: 'Profile',
            action: () => onNavigate(5)
        },
        {
            icon: '💳',
            text: 'Payments',
            action: () => onNavigate(2)
        },
        {
            icon: '📜',
            text: 'Certificate',
            action: () => onNavigate(7)  // Navigate to Certificate page
        },

        {
            icon: '⚙️',  // Added Settings
            text: 'Settings',
            action: () => onNavigate(6)  // Navigate to Settings page
        },
        {
            icon: '🚪',
            text: 'Logout',
            action: () => onNavigate(8)  // Navigate to Logout page
        }
    ];

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 'bold', color: '#333' }}>
                More Options
            </h3>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {moreMenuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={item.action}
                        style={{
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            borderBottom: index < moreMenuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <span style={{ fontSize: '24px' }}>{item.icon}</span>
                        <span style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{item.text}</span>
                        <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: '18px' }}>›</span>
                    </div>
                ))}
            </div>
        </div>
    );
};




interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}
const Payments: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { themeColor } = useTheme();

    const paymentCards: CardData[] = [
        { title: 'Statement Earnings', value: '₹12,500', color: themeColor },
        { title: 'Weekly Gross Earning', value: '₹8,750', color: themeColor },
        { title: 'Advance Request', value: '₹2,000', color: themeColor },
        { title: 'TDS 1.0%', value: '₹125', color: themeColor },
        { title: 'Net Paid Amount', value: '₹11,125', color: themeColor },
        { title: 'Payment Status', value: 'Paid', color: themeColor },
    ];

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Payment Details
            </h3>

            {/* Payment Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {paymentCards.map((card, index) => (
                    <InfoCard key={index} {...card} />
                ))}
            </div>

            {/* Tabs */}
            <TabPanel activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};
const RiderDashboardContent: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const { themeColor, setThemeColor } = useTheme();

    const navItems = [
        { label: 'Dashboard', icon: '🏠' },
        { label: 'Orders', icon: '📦' },
        { label: 'Payments', icon: '💳' },
        { label: 'Attendance', icon: '📅' },
        { label: 'More', icon: '⋯' },
    ];

    const handleThemeChange = (color: string) => {
        setThemeColor(color);
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 0:
                return <Dashboard />;
            case 1:
                return <Orders />;
            case 2:
                return <Payments />;
            case 3:
                return <Attendance />;
            case 4:
                return <More onNavigate={setCurrentPage} />;
            case 5:
                return <Profile />;
            case 6:
                return <Settings themeColor={themeColor} onThemeChange={handleThemeChange} />;
            case 7:  // Certificate page
                return <Certificate />;
            case 8:  // Logout page
                return <Logout onNavigate={setCurrentPage} />;
            default:
                return <Dashboard />;
        }
    };

    const handleNavClick = (index: number) => {
        setCurrentPage(index);
        setShowMoreMenu(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            minWidth: '100vw',
            backgroundColor: '#f5f5f5',
            paddingBottom: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Top AppBar */}
            <div style={{
                position: 'sticky',
                top: 0,
                backgroundColor: themeColor,
                color: 'white',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                    Rider Dashboard
                </h2>

                {/* Profile Picture with Dropdown */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={durgarao}
                        alt="Rider"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }}
                    />
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '45px',
                            right: 0,
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            minWidth: '150px',
                            zIndex: 1001
                        }}>
                            {[
                                { icon: '👤', text: 'Profile', page: 5 },
                                { icon: '⚙️', text: 'Settings', page: 6 },
                                { icon: '🚪', text: 'Logout', action: () => navigate('/login') },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        if (item.action) {
                                            item.action();
                                        } else if (item.page !== undefined) {
                                            setCurrentPage(item.page);
                                        }
                                    }}
                                    style={{
                                        padding: '12px 16px',
                                        color: '#333',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span>{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ minHeight: 'calc(100vh - 140px)' }}>
                {renderCurrentPage()}
            </div>

            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <div style={{
                    display: 'flex',
                    height: '70px'
                }}>
                    {navItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleNavClick(index)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: currentPage === index ? themeColor : '#666',
                                backgroundColor: currentPage === index ? `${themeColor}15` : 'transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                                {item.icon}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: currentPage === index ? 'bold' : 'normal'
                            }}>
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

// Wrapper component that provides the theme context
const RiderDashboardApp: React.FC = () => {
    return (
        <ThemeProvider>
            <RiderDashboardContent />
        </ThemeProvider>
    );
};

export default RiderDashboardApp;