import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Snackbar } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';

interface LogoutProps {
    onNavigate: (pageIndex: number) => void;
}

const Logout: React.FC<LogoutProps> = ({ onNavigate }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { themeColor } = useTheme();

    const handleLogout = () => {
        console.log('User logged out');
        setShowConfirmModal(false);
        setOpenSnackbar(true);
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '20px' }}>
                    Ready to Logout?
                </h3>
                <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
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

            {showConfirmModal && (
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
                        <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Confirm Logout</h4>
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
            )}
        </div>
    );
};

export default Logout; 