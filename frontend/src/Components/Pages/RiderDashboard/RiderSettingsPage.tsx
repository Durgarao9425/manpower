import { useState } from "react";

interface SettingsProps {
    themeColor: string;
    onThemeChange: (color: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ themeColor, onThemeChange }) => {
    const [notifications, setNotifications] = useState({
        orderAlerts: true,
        paymentUpdates: true,
        promotionalOffers: false,
        systemUpdates: true,
        deliveryReminders: true,
        emergencyAlerts: true
    });

    const [preferences, setPreferences] = useState({
        language: 'english',
        currency: 'INR',
        distanceUnit: 'km',
        workingHours: '9-5',
        autoAcceptOrders: false,
        showEarningsPublic: false
    });

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const predefinedColors = [
        { name: 'Blue', color: '#1976d2' },
        { name: 'Green', color: '#4caf50' },
        { name: 'Orange', color: '#ff9800' },
        { name: 'Purple', color: '#9c27b0' },
        { name: 'Red', color: '#f44336' },
        { name: 'Teal', color: '#009688' },
        { name: 'Indigo', color: '#3f51b5' },
        { name: 'Pink', color: '#e91e63' }
    ];

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        console.log('Password change requested');
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
    };

    const handleColorChange = (color) => {
        if (onThemeChange) {
            onThemeChange(color);
        }
        setShowColorPicker(false);
    };

    const settingSections = [
        {
            title: 'Theme & Appearance',
            items: [
                {
                    icon: '🎨',
                    title: 'Theme Color',
                    subtitle: 'Customize app appearance',
                    action: () => setShowColorPicker(true),
                    showCurrentColor: true
                },
                {
                    icon: '🌙',
                    title: 'Dark Mode',
                    subtitle: 'Coming soon',
                    action: () => console.log('Dark mode toggle')
                }
            ]
        },
        {
            title: 'Account & Profile',
            items: [
                {
                    icon: '🔒',
                    title: 'Change Password',
                    subtitle: 'Update your account password',
                    action: () => setShowChangePasswordModal(true)
                },
                {
                    icon: '📱',
                    title: 'Phone Number',
                    subtitle: '+91 6303359425',
                    action: () => console.log('Change phone number')
                },
                {
                    icon: '📧',
                    title: 'Email Address',
                    subtitle: 'durgarao9425@gmail.com',
                    action: () => console.log('Change email')
                },
                {
                    icon: '🆔',
                    title: 'Rider ID',
                    subtitle: 'RDR001234',
                    action: () => console.log('View rider details')
                }
            ]
        },
        {
            title: 'Delivery Preferences',
            items: [
                {
                    icon: '🚚',
                    title: 'Working Hours',
                    subtitle: `${preferences.workingHours}`,
                    action: () => console.log('Set working hours')
                },
                {
                    icon: '📍',
                    title: 'Delivery Zone',
                    subtitle: 'Hyderabad Central',
                    action: () => console.log('Change delivery zone')
                },
                {
                    icon: '⚡',
                    title: 'Auto Accept Orders',
                    subtitle: preferences.autoAcceptOrders ? 'Enabled' : 'Disabled',
                    action: () => handlePreferenceChange('autoAcceptOrders', !preferences.autoAcceptOrders)
                },
                {
                    icon: '📏',
                    title: 'Distance Unit',
                    subtitle: preferences.distanceUnit.toUpperCase(),
                    action: () => console.log('Change distance unit')
                }
            ]
        },
        {
            title: 'Privacy & Security',
            items: [
                {
                    icon: '🛡️',
                    title: 'Privacy Policy',
                    subtitle: 'View our privacy policy',
                    action: () => console.log('Privacy policy')
                },
                {
                    icon: '🔐',
                    title: 'Data Security',
                    subtitle: 'Manage your data preferences',
                    action: () => console.log('Data security')
                },
                {
                    icon: '📍',
                    title: 'Location Sharing',
                    subtitle: 'Always allowed during delivery',
                    action: () => console.log('Location settings')
                },
                {
                    icon: '👁️',
                    title: 'Profile Visibility',
                    subtitle: preferences.showEarningsPublic ? 'Public' : 'Private',
                    action: () => handlePreferenceChange('showEarningsPublic', !preferences.showEarningsPublic)
                },
                {
                    icon: '🔑',
                    title: 'Two-Factor Auth',
                    subtitle: 'Not enabled',
                    action: () => console.log('Setup 2FA')
                }
            ]
        },
        {
            title: 'Company & Delivery Management',
            items: [
                {
                    icon: '🏢',
                    title: 'Company Portal',
                    subtitle: 'Access management dashboard',
                    action: () => console.log('Company portal')
                },
                {
                    icon: '📊',
                    title: 'Performance Analytics',
                    subtitle: 'View delivery statistics',
                    action: () => console.log('Performance analytics')
                },
                {
                    icon: '🎯',
                    title: 'Target & Goals',
                    subtitle: 'Monthly delivery targets',
                    action: () => console.log('Targets')
                },
                {
                    icon: '💼',
                    title: 'Supplier Network',
                    subtitle: 'Connected suppliers: 15',
                    action: () => console.log('Supplier network')
                }
            ]
        },
        {
            title: 'Support & Help',
            items: [
                {
                    icon: '💬',
                    title: 'Contact Support',
                    subtitle: '24/7 rider support available',
                    action: () => console.log('Contact support')
                },
                {
                    icon: '❓',
                    title: 'FAQ',
                    subtitle: 'Frequently asked questions',
                    action: () => console.log('FAQ')
                },
                {
                    icon: '📖',
                    title: 'Terms of Service',
                    subtitle: 'View terms and conditions',
                    action: () => console.log('Terms of service')
                },
                {
                    icon: '🚨',
                    title: 'Emergency Contacts',
                    subtitle: 'Emergency support numbers',
                    action: () => console.log('Emergency contacts')
                },
                {
                    icon: '📚',
                    title: 'Training Materials',
                    subtitle: 'Delivery best practices',
                    action: () => console.log('Training materials')
                },
                {
                    icon: '💡',
                    title: 'Feedback',
                    subtitle: 'Share your suggestions',
                    action: () => console.log('Feedback')
                }
            ]
        }
    ];

    return (
        <div style={{ padding: '16px', paddingBottom: '32px' }}>
            <h3 style={{ marginBottom: '24px', fontWeight: 'bold', color: '#333' }}>
                Settings
            </h3>

            {/* Notification Settings */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    🔔 Notifications
                </h4>

                {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div>
                            <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                        </div>
                        <div
                            onClick={() => handleNotificationToggle(key)}
                            style={{
                                width: '32px',
                                height: '16px',
                                borderRadius: '10px',
                                backgroundColor: value ? themeColor : '#ccc',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                display: 'inline-block'
                            }}
                        >
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: '2px',
                                left: value ? '18px' : '2px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Settings Sections */}
            {settingSections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        padding: '16px 20px 12px 20px',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '14px', fontWeight: '600' }}>
                            {section.title}
                        </h4>
                    </div>

                    {section.items.map((item, itemIndex) => (
                        <div
                            key={itemIndex}
                            onClick={item.action}
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer',
                                borderBottom: itemIndex < section.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                    {item.subtitle}
                                </div>
                            </div>
                            {item.showCurrentColor && (
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: themeColor,
                                    marginRight: '8px',
                                    border: '2px solid #fff',
                                    boxShadow: '0 0 0 1px #ddd'
                                }} />
                            )}
                            <span style={{ color: '#ccc', fontSize: '16px' }}>›</span>
                        </div>
                    ))}
                </div>
            ))}

            {/* App Info */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                    Manpower Delivery Management System
                </div>
                <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>
                    Rider Dashboard App • Version 2.0.0
                </div>
                <div style={{ color: '#999', fontSize: '11px' }}>
                    Build 2024.06.02 • Supplier Network Connected
                </div>
            </div>

            {/* Color Picker Modal */}
            {showColorPicker && (
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
                            maxWidth: '320px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h4 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center' }}>
                                Choose Theme Color
                            </h4>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                {predefinedColors.map((colorOption) => (
                                    <div
                                        key={colorOption.color}
                                        onClick={() => handleColorChange(colorOption.color)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            backgroundColor: colorOption.color,
                                            cursor: 'pointer',
                                            border: themeColor === colorOption.color ? '3px solid #333' : '2px solid #fff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {themeColor === colorOption.color && (
                                            <span style={{ color: 'white', fontSize: '16px' }}>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => setShowColorPicker(false)}
                                    style={{
                                        padding: '10px 24px',
                                        backgroundColor: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
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
                            maxWidth: '400px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>
                                Change Password
                            </h4>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowChangePasswordModal(false);
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
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
                                <button
                                    onClick={handlePasswordChange}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: themeColor,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Settings;