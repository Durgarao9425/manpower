export const DateFilter: React.FC<{
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onFilter: () => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
            Filter by Date Range
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Start Date
                </div>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    End Date
                </div>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>
        </div>
        <button
            onClick={onFilter}
            style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        >
            Apply Filter
        </button>
    </div>
);


// Reusable Components
export const StatsCard: React.FC<{ title: string; value: string; color: string }> = ({
    title,
    value,
    color,
}) => (
    <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            {title}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>
            {value}
        </div>
    </div>
);