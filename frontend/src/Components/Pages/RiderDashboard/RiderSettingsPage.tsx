import { useState, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";
import { ThemeContext } from "../../../context/ThemeContext";

interface SettingsProps {
    onThemeChange?: (color: string) => void;
}

interface ReferralData {
    code: string;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    earnings: number;
}

interface NotificationSettings {
    orderAlerts: boolean;
    paymentUpdates: boolean;
    promotionalOffers: boolean;
    systemUpdates: boolean;
    deliveryReminders: boolean;
    emergencyAlerts: boolean;
}

interface Preferences {
    language: string;
    currency: string;
    distanceUnit: string;
    workingHours: string;
    autoAcceptOrders: boolean;
    showEarningsPublic: boolean;
}

interface SettingItem {
    icon: string;
    title: string;
    subtitle: string;
    action: () => void;
    showCurrentColor?: boolean;
    showCopyButton?: boolean;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

const Settings: React.FC<SettingsProps> = ({ onThemeChange }) => {
    const { isDarkMode, toggleDarkMode, themeColor, setThemeColor } = useContext(ThemeContext);
    const [notifications, setNotifications] = useState<NotificationSettings>({
        orderAlerts: true,
        paymentUpdates: true,
        promotionalOffers: false,
        systemUpdates: true,
        deliveryReminders: true,
        emergencyAlerts: true
    });

    const [preferences, setPreferences] = useState<Preferences>({
        language: 'english',
        currency: 'INR',
        distanceUnit: 'km',
        workingHours: '9-5',
        autoAcceptOrders: false,
        showEarningsPublic: false
    });

    const [referralData] = useState<ReferralData>({
        code: 'RDR001234',
        totalReferrals: 5,
        pendingReferrals: 2,
        completedReferrals: 3,
        earnings: 1500
    });

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [referralInput, setReferralInput] = useState('');
    const [showReferralInput, setShowReferralInput] = useState(false);

    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info'
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

    const handleNotificationToggle = (key: keyof NotificationSettings) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePreferenceChange = (key: keyof Preferences, value: string | boolean) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setToast({
            open: true,
            message,
            severity
        });
    };

    const handleCloseToast = () => {
        setToast(prev => ({ ...prev, open: false }));
    };

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match!', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters long!', 'error');
            return;
        }
        console.log('Password change requested');
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password changed successfully!', 'success');
    };

    const handleColorChange = (color: string) => {
        setThemeColor(color);
        if (onThemeChange) {
            onThemeChange(color);
        }
        setShowColorPicker(false);
        showToast('Theme color updated successfully!', 'success');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Referral code copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy to clipboard', 'error');
        });
    };

    const shareReferral = () => {
        const shareText = `Join me as a rider! Use my referral code ${referralData.code} to sign up and get ₹500 bonus on your first delivery!`;
        if (navigator.share) {
            navigator.share({
                title: 'Join as a Rider',
                text: shareText,
                url: 'https://your-app-url.com/referral'
            }).catch(err => {
                console.error('Error sharing:', err);
            });
        } else {
            copyToClipboard(shareText);
        }
    };

    const handleReferralInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow digits
        if (!/^\d*$/.test(value)) {
            return;
        }
        // If first digit is entered, validate it's 6-9
        if (value.length === 1 && !/[6-9]/.test(value)) {
            showToast('Referral number must start with 6, 7, 8, or 9', 'error');
            return;
        }
        // Limit to 10 digits
        if (value.length <= 10) {
            setReferralInput(value);
        }
    };

    const handleReferralSubmit = () => {
        if (!referralInput.trim()) {
            showToast('Please enter a referral number', 'error');
            return;
        }
        if (referralInput.length !== 10) {
            showToast('Referral number must be 10 digits', 'error');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(referralInput)) {
            showToast('Invalid referral number format', 'error');
            return;
        }
        console.log('Referral number submitted:', referralInput);
        // Here you would typically make an API call to validate and process the referral
        showToast('Referral number submitted successfully!', 'success');
        setReferralInput('');
        setShowReferralInput(false);
    };

    const handleDarkModeToggle = () => {
        toggleDarkMode();
        showToast(`Dark mode ${isDarkMode ? 'disabled' : 'enabled'}`, 'success');
    };

    const settingSections: SettingSection[] = [
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
                    subtitle: isDarkMode ? 'Enabled' : 'Disabled',
                    action: handleDarkModeToggle
                }
            ]
        },
        {
            title: 'Referral Program',
            items: [
                {
                    icon: '🎁',
                    title: 'Your Referral Code',
                    subtitle: referralData.code,
                    action: () => copyToClipboard(referralData.code),
                    showCopyButton: true
                },
                {
                    icon: '🔑',
                    title: 'Enter Referral Number',
                    subtitle: 'Have a referral Number? Enter it here',
                    action: () => setShowReferralInput(true)
                },
                {
                    icon: '👥',
                    title: 'Total Referrals',
                    subtitle: `${referralData.totalReferrals} riders joined`,
                    action: () => console.log('View referrals')
                },
                {
                    icon: '⏳',
                    title: 'Pending Referrals',
                    subtitle: `${referralData.pendingReferrals} riders pending`,
                    action: () => console.log('View pending referrals')
                },
                {
                    icon: '✅',
                    title: 'Completed Referrals',
                    subtitle: `${referralData.completedReferrals} riders completed`,
                    action: () => console.log('View completed referrals')
                },
                {
                    icon: '💰',
                    title: 'Referral Earnings',
                    subtitle: `₹${referralData.earnings} earned`,
                    action: () => console.log('View earnings')
                },
                {
                    icon: '📱',
                    title: 'Share Referral',
                    subtitle: 'Invite friends to join',
                    action: shareReferral
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
        <div style={{ 
            padding: '16px', 
            paddingBottom: '32px',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h3 style={{ 
                marginBottom: '24px', 
                fontWeight: 'bold', 
                color: isDarkMode ? '#fff' : '#333' 
            }}>
                Settings
            </h3>

            {/* Notification Settings - Commented out
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
                            onClick={() => handleNotificationToggle(key as keyof NotificationSettings)}
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
            */}

            {/* Settings Sections */}
            {settingSections.map((section, sectionIndex) => (
                <div key={sectionIndex} style={{
                    backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        padding: '16px 20px 12px 20px',
                        borderBottom: `1px solid ${isDarkMode ? '#404040' : '#f0f0f0'}`,
                        backgroundColor: isDarkMode ? '#363636' : '#f8f9fa'
                    }}>
                        <h4 style={{ 
                            margin: 0, 
                            color: isDarkMode ? '#fff' : '#333', 
                            fontSize: '14px', 
                            fontWeight: '600' 
                        }}>
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
                                borderBottom: itemIndex < section.items.length - 1 ? 
                                    `1px solid ${isDarkMode ? '#404040' : '#f0f0f0'}` : 'none',
                                transition: 'background-color 0.2s ease',
                                backgroundColor: isDarkMode ? '#2d2d2d' : 'white'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#363636' : '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2d2d2d' : 'white'}
                        >
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: '500', 
                                    color: isDarkMode ? '#fff' : '#333', 
                                    fontSize: '14px' 
                                }}>
                                    {item.title}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: isDarkMode ? '#aaa' : '#666', 
                                    marginTop: '2px' 
                                }}>
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
                            {item.showCopyButton && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(item.subtitle);
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: isDarkMode ? '#404040' : '#f0f0f0',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: isDarkMode ? '#fff' : '#666',
                                        cursor: 'pointer',
                                        marginRight: '8px'
                                    }}
                                >
                                    Copy
                                </button>
                            )}
                            <span style={{ color: isDarkMode ? '#666' : '#ccc', fontSize: '16px' }}>›</span>
                        </div>
                    ))}
                </div>
            ))}

            {/* App Info */}
            <div style={{
                backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: isDarkMode ? '#aaa' : '#666', fontSize: '12px', marginBottom: '8px' }}>
                    Manpower Delivery Management System
                </div>
                <div style={{ color: isDarkMode ? '#888' : '#999', fontSize: '11px', marginBottom: '4px' }}>
                    Rider Dashboard App • Version 2.0.0
                </div>
                <div style={{ color: isDarkMode ? '#888' : '#999', fontSize: '11px' }}>
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
                            backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '320px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}>
                            <h4 style={{ 
                                margin: '0 0 20px 0', 
                                color: isDarkMode ? '#fff' : '#333', 
                                textAlign: 'center' 
                            }}>
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
                                        backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
                                        color: isDarkMode ? '#fff' : '#666',
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

            {/* Referral Input Modal */}
            {showReferralInput && (
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
                                Enter Referral Number
                            </h4>

                            <div style={{ marginBottom: '24px' }}>
                                <input
                                    type="tel"
                                    value={referralInput}
                                    onChange={handleReferralInputChange}
                                    placeholder="Enter 10-digit referral number"
                                    maxLength={10}
                                    inputMode="numeric"
                                    pattern="[6-9][0-9]{9}"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#666', 
                                    marginTop: '8px',
                                    textAlign: 'left'
                                }}>
                                    Must be a 10-digit number starting with 6, 7, 8, or 9
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowReferralInput(false);
                                        setReferralInput('');
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
                                    onClick={handleReferralSubmit}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: themeColor,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Toast Message */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseToast} 
                    severity={toast.severity}
                    sx={{ 
                        width: '100%',
                        backgroundColor: isDarkMode ? '#2d2d2d' : 'white',
                        color: isDarkMode ? '#fff' : 'inherit'
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Settings;