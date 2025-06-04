import durgarao from "../../../Images/durgarao.jpeg"
import MyDocuments from "./MyDocuments"
import { useState } from 'react'

const Profile: React.FC = () => {
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

    return (
        <div style={{ padding: '16px' }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                marginBottom: '24px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 16px'
                }}>
                    <img
                        src={durgarao}
                        alt="Rider"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Durgarao Goriparthi</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>ID: RD001234</p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>+91 6303359425</p>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
            }}>
                {[
                    { icon: '📄', label: 'Documents', value: 'All Verified', onClick: () => setIsDocumentsOpen(true) },
                    { icon: '🏆', label: 'Rating', value: '4.8/5' },
                    { icon: '🚗', label: 'Vehicle', value: 'Honda City' },
                    { icon: '📅', label: 'Joined', value: 'Jan 2024' },
                ].map((item, index) => (
                    <div
                        key={index}
                        onClick={item.onClick}
                        style={{
                            padding: '16px',
                            borderBottom: index < 3 ? '1px solid #e0e0e0' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: item.onClick ? 'pointer' : 'default'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Documents Drawer */}
            <MyDocuments 
                isOpen={isDocumentsOpen} 
                onClose={() => setIsDocumentsOpen(false)} 
            />
        </div>
    );
};

export default Profile;