import type { CardData } from "./types";

export const TabPanel: React.FC<{ activeTab: number; onTabChange: (tab: number) => void }> = ({
    activeTab,
    onTabChange,
}) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
            {['Statement Summary', 'Final Payment'].map((tab, index) => (
                <div
                    key={index}
                    onClick={() => onTabChange(index)}
                    style={{
                        flex: 1,
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: activeTab === index ? '#1976d2' : 'transparent',
                        color: activeTab === index ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 'bold',
                        fontSize: '10px'
                    }}
                >
                    {tab}
                </div>
            ))}
        </div>
        <div style={{ padding: '24px' }}>
            {activeTab === 0 ? (
                <div>
                    <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Statement Summary</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Total Rides</span>
                            <span style={{ fontWeight: 'bold' }}>156</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Base Fare</span>
                            <span style={{ fontWeight: 'bold' }}>₹8,750</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Incentives</span>
                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>₹1,250</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>Total Earnings</span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1976d2' }}>₹10,000</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>Final Payment Details</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Gross Amount</span>
                            <span style={{ fontWeight: 'bold' }}>₹10,000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>TDS (1%)</span>
                            <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₹100</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ color: '#666' }}>Fuel Allowance</span>
                            <span style={{ fontWeight: 'bold', color: '#4caf50' }}>₹500</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ color: '#666', fontWeight: 'bold' }}>Net Payable</span>
                            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#4caf50' }}>₹10,400</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);


export const InfoCard: React.FC<CardData> = ({ title, value, color = '#1976d2' }) => (
    <div style={{
        padding: '16px',
        borderRadius: '12px',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {title}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>
            {value}
        </div>
    </div>
);