import { useEffect, useState } from "react";

const Certificate: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [selectedPerformance, setSelectedPerformance] = useState('all');
    const [filteredCertificates, setFilteredCertificates] = useState([]);

    // Sample certificate data
    const certificates = [
        {
            id: 1,
            title: 'Excellence in Service',
            description: 'Outstanding performance for 3 consecutive months',
            month: 'march',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-03-31',
            certificateUrl: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Excellence+Certificate',
            badge: '🏆'
        },
        {
            id: 2,
            title: 'Safe Driving Award',
            description: 'Zero incidents record for Q1 2024',
            month: 'march',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-03-15',
            certificateUrl: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Safe+Driving+Award',
            badge: '🛡️'
        },
        {
            id: 3,
            title: 'Customer Satisfaction',
            description: '4.8+ rating achievement',
            month: 'february',
            year: '2024',
            performance: 'high',
            achievedDate: '2024-02-28',
            certificateUrl: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Customer+Satisfaction',
            badge: '⭐'
        },
        {
            id: 4,
            title: 'Monthly Achiever',
            description: 'Top performer for January 2024',
            month: 'january',
            year: '2024',
            performance: 'medium',
            achievedDate: '2024-01-31',
            certificateUrl: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Monthly+Achiever',
            badge: '🎯'
        },
        {
            id: 5,
            title: 'Punctuality Award',
            description: 'Perfect attendance record',
            month: 'december',
            year: '2023',
            performance: 'medium',
            achievedDate: '2023-12-31',
            certificateUrl: 'https://via.placeholder.com/400x300/607D8B/FFFFFF?text=Punctuality+Award',
            badge: '⏰'
        }
    ];

    const months = [
        { value: 'all', label: 'All Months' },
        { value: 'january', label: 'January' },
        { value: 'february', label: 'February' },
        { value: 'march', label: 'March' },
        { value: 'april', label: 'April' },
        { value: 'may', label: 'May' },
        { value: 'june', label: 'June' },
        { value: 'july', label: 'July' },
        { value: 'august', label: 'August' },
        { value: 'september', label: 'September' },
        { value: 'october', label: 'October' },
        { value: 'november', label: 'November' },
        { value: 'december', label: 'December' }
    ];

    const years = ['2024', '2023', '2022'];
    const performanceLevels = [
        { value: 'all', label: 'All Levels' },
        { value: 'high', label: 'High Performance' },
        { value: 'medium', label: 'Medium Performance' },
        { value: 'low', label: 'Low Performance' }
    ];

    useEffect(() => {
        applyFilters();
    }, [selectedMonth, selectedYear, selectedPerformance]);

    const applyFilters = () => {
        let filtered = certificates.filter(cert => {
            const monthMatch = selectedMonth === 'all' || cert.month === selectedMonth;
            const yearMatch = cert.year === selectedYear;
            const performanceMatch = selectedPerformance === 'all' || cert.performance === selectedPerformance;

            return monthMatch && yearMatch && performanceMatch;
        });

        setFilteredCertificates(filtered);
    };

    const handleDownloadCertificate = (certificate) => {
        console.log('Downloading certificate:', certificate.title);
        // In a real app, you would trigger download here
        window.open(certificate.certificateUrl, '_blank');
    };

    const handleViewCertificate = (certificate) => {
        console.log('Viewing certificate:', certificate.title);
        window.open(certificate.certificateUrl, '_blank');
    };

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
                My Certificates
            </h3>

            {/* Filter Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '16px' }}>
                    🔍 Filter Certificates
                </h4>

                <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                    {/* Month Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Performance Level Filter */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            Performance Level
                        </label>
                        <select
                            value={selectedPerformance}
                            onChange={(e) => setSelectedPerformance(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white'
                            }}
                        >
                            {performanceLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={applyFilters}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                >
                    Apply Filters ({filteredCertificates.length} results)
                </button>
            </div>

            {/* Results Summary */}
            <div style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <span style={{ fontSize: '14px', color: '#1976d2' }}>
                    Showing {filteredCertificates.length} certificate(s) for {selectedYear}
                    {selectedMonth !== 'all' && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
                    {selectedPerformance !== 'all' && ` - ${performanceLevels.find(p => p.value === selectedPerformance)?.label}`}
                </span>
            </div>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredCertificates.map((certificate) => (
                        <div
                            key={certificate.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: '1px solid #f0f0f0'
                            }}
                        >
                            {/* Certificate Image */}
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={certificate.certificateUrl}
                                    alt={certificate.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    borderRadius: '20px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: certificate.performance === 'high' ? '#4caf50' :
                                        certificate.performance === 'medium' ? '#ff9800' : '#f44336'
                                }}>
                                    {certificate.performance.toUpperCase()}
                                </div>
                            </div>

                            {/* Certificate Details */}
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>{certificate.badge}</span>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '16px' }}>
                                            {certificate.title}
                                        </h4>
                                        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                                            {certificate.description}
                                        </p>
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            Achieved on: {certificate.achievedDate}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleViewCertificate(certificate)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={() => handleDownloadCertificate(certificate)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📥 Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>No certificates found</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        Try adjusting your filters or check back later for new achievements.
                    </p>
                </div>
            )}
        </div>
    );
};
export default Certificate;