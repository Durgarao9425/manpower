import { useState } from "react";
import { DateFilter } from "./DateFilter";
import { InfoCard } from "./TablePannel";

interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}

export const Orders: React.FC = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const orderCards: CardData[] = [
        { title: 'Total Orders', value: 45, color: '#2196f3' },
        { title: 'Weekly Earnings', value: '₹8,750', color: '#4caf50' },
        { title: 'Advance Request', value: '₹2,000', color: '#ff9800' },
        { title: 'Advance Paid', value: '₹1,500', color: '#9c27b0' },
        { title: 'Advance Pending', value: '₹500', color: '#f44336' },
        { title: 'Due Amount', value: '₹300', color: '#795548' },
    ];

    const handleFilter = () => {
        console.log('Filtering data from', startDate, 'to', endDate);
        // Filter logic here
    };

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Orders Overview
            </h3>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {orderCards.map((card, index) => (
                    <InfoCard key={index} {...card} />
                ))}
            </div>

            {/* Date Filter */}
            <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFilter={handleFilter}
            />
        </div>
    );
};