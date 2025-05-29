import { useState } from "react";
import { InfoCard, TabPanel } from "./RiderDashboard";

interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}
export const Payments: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const paymentCards: CardData[] = [
        { title: 'Statement Earnings', value: '₹12,500', color: '#4caf50' },
        { title: 'Weekly Gross Earning', value: '₹8,750', color: '#2196f3' },
        { title: 'Advance Request', value: '₹2,000', color: '#ff9800' },
        { title: 'TDS 1.0%', value: '₹125', color: '#f44336' },
        { title: 'Net Paid Amount', value: '₹11,125', color: '#9c27b0' },
        { title: 'Payment Status', value: 'Paid', color: '#4caf50' },
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