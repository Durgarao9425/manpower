import { Alert, alpha, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Modal, Paper, Select, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material';
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import durgarao from '../../../Images/durgarao.jpeg';
import {
    SwipeRight as SwipeRightIcon,
    Close as CloseIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useState } from "react";
import { InfoCard, TabPanel } from "./TablePannel";
import { ThemeProvider, useTheme } from '../../../context/ThemeContext';
import Loader from '../../Common/Loaders';

// Update CardData interface to make icon optional
interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}

// Lazy load components
const Attendance = lazy(() => import('./Attendance'));
const Orders = lazy(() => import('./RiderOrdersPage'));
const Profile = lazy(() => import('./RiderProfilePage'));
const Settings = lazy(() => import('./RiderSettingsPage'));
const Certificate = lazy(() => import('./RiderCertificatePage'));
const Dashboard = lazy(() => import('./DashboardReusable'));
const Logout = lazy(() => import('./Logout'));
const More = lazy(() => import('./More'));

const Payments: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { themeColor } = useTheme();

    const paymentCards: CardData[] = [
        { title: 'Statement Earnings', value: '₹12,500', color: themeColor, icon: '💰' },
        { title: 'Weekly Gross Earning', value: '₹8,750', color: themeColor, icon: '💵' },
        { title: 'Advance Request', value: '₹2,000', color: themeColor, icon: '🏦' },
        { title: 'TDS 1.0%', value: '₹125', color: themeColor, icon: '📊' },
        { title: 'Net Paid Amount', value: '₹11,125', color: themeColor, icon: '💸' },
        { title: 'Payment Status', value: 'Paid', color: themeColor, icon: '✅' },
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
    const [isLoading, setIsLoading] = useState(true);
    const { themeColor, setThemeColor } = useTheme();

    const navItems = [
        { label: 'Dashboard', icon: '🏠' },
        { label: 'Orders', icon: '📦' },
        { label: 'Payments', icon: '💳' },
        { label: 'Attendance', icon: '📅' },
        { label: 'More', icon: '⋯' },
    ];

    // Preload essential data
    useEffect(() => {
        const preloadData = async () => {
            try {
                // Add any initial data loading here
                setIsLoading(false);
            } catch (error) {
                console.error('Error preloading data:', error);
                setIsLoading(false);
            }
        };

        preloadData();
    }, []);

    const handleThemeChange = (color: string) => {
        setThemeColor(color);
    };

    const renderCurrentPage = () => {
        if (isLoading) {
            return <Loader message="Loading dashboard..." size="large" fullScreen />;
        }

        return (
            <Suspense fallback={<Loader message="Loading page..." size="medium" />}>
                {(() => {
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
                        case 7:
                            return <Certificate />;
                        case 8:
                            return <Logout onNavigate={setCurrentPage} />;
                        default:
                            return <Dashboard />;
                    }
                })()}
            </Suspense>
        );
    };

    const handleNavClick = (index: number) => {
        setCurrentPage(index);
        setShowProfileMenu(false);
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