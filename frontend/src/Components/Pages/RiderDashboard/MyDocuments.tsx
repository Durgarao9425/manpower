import React, { useState, useEffect, useRef } from 'react';

interface Document {
    id: number;
    documentType: string;
    documentNumber: string;
    expireDate: string;
    status: 'Verified' | 'Pending' | 'Expired';
    fileUrl?: string;
}

interface MyDocumentsProps {
    isOpen: boolean;
    onClose: () => void;
}

const MyDocuments: React.FC<MyDocumentsProps> = ({ isOpen, onClose }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const observerTarget = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Handle scroll behavior
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollContainerRef.current) return;
            
            const currentScrollY = scrollContainerRef.current.scrollTop;
            
            // Show button when scrolling up or at the bottom
            if (currentScrollY < lastScrollY || 
                currentScrollY + scrollContainerRef.current.clientHeight >= scrollContainerRef.current.scrollHeight - 100) {
                setIsButtonVisible(true);
            } else {
                setIsButtonVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [lastScrollY]);

    // Generate dummy data for infinite scroll
    const generateDummyData = (pageNum: number) => {
        const newDocs: Document[] = [];
        for (let i = 0; i < 10; i++) {
            newDocs.push({
                id: (pageNum - 1) * 10 + i + 1,
                documentType: ['Driving License', 'Aadhar Card', 'PAN Card', 'Passport', 'Voter ID'][Math.floor(Math.random() * 5)],
                documentNumber: `DOC${Math.floor(Math.random() * 1000000)}`,
                expireDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0],
                status: ['Verified', 'Pending', 'Expired'][Math.floor(Math.random() * 3)] as 'Verified' | 'Pending' | 'Expired',
                fileUrl: 'https://example.com/doc.pdf'
            });
        }
        return newDocs;
    };

    // Load more documents
    const loadMoreDocuments = () => {
        if (loading || !hasMore) return;
        setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            const newDocs = generateDummyData(page);
            setDocuments(prev => [...prev, ...newDocs]);
            setPage(prev => prev + 1);
            setHasMore(page < 5); // Stop after 5 pages for demo
            setLoading(false);
        }, 1000);
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMoreDocuments();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [page, loading, hasMore]);

    // Reset when drawer opens
    useEffect(() => {
        if (isOpen) {
            setDocuments([]);
            setPage(1);
            setHasMore(true);
            loadMoreDocuments();
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        documentType: '',
        documentNumber: '',
        expireDate: '',
        status: 'Pending' as const
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newDocument: Document = {
            id: documents.length + 1,
            ...formData,
            fileUrl: 'https://example.com/new-doc.pdf'
        };
        setDocuments(prev => [newDocument, ...prev]);
        setFormData({
            documentType: '',
            documentNumber: '',
            expireDate: '',
            status: 'Pending'
        });
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            maxWidth: '400px',
            height: '100vh',
            backgroundColor: 'white',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                zIndex: 1
            }}>
                <h2 style={{ 
                    margin: 0,
                    fontSize: '1.25rem'
                }}>My Documents</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%'
                    }}
                >
                    ×
                </button>
            </div>

            {/* Document List with Infinite Scroll */}
            <div 
                ref={scrollContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    WebkitOverflowScrolling: 'touch',
                    position: 'relative'
                }}
            >
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            marginBottom: '12px'
                        }}
                    >
                        <h3 style={{ 
                            marginBottom: '8px',
                            fontSize: '1rem',
                            color: '#333'
                        }}>{doc.documentType}</h3>
                        <p style={{ 
                            margin: '4px 0',
                            fontSize: '0.9rem',
                            color: '#666'
                        }}>Number: {doc.documentNumber}</p>
                        <p style={{ 
                            margin: '4px 0',
                            fontSize: '0.9rem',
                            color: '#666'
                        }}>Expires: {doc.expireDate}</p>
                        <p style={{ 
                            margin: '4px 0',
                            fontSize: '0.9rem',
                            color: doc.status === 'Verified' ? '#28a745' : 
                                   doc.status === 'Pending' ? '#ffc107' : '#dc3545'
                        }}>
                            Status: {doc.status}
                        </p>
                        <div style={{ 
                            marginTop: '12px', 
                            display: 'flex', 
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    flex: 1,
                                    minWidth: '80px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                View
                            </button>
                            <button
                                onClick={() => {/* Add edit functionality */}}
                                style={{
                                    backgroundColor: '#ffc107',
                                    color: 'black',
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    flex: 1,
                                    minWidth: '80px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    flex: 1,
                                    minWidth: '80px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                <div ref={observerTarget} style={{ 
                    height: '20px', 
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {loading && (
                        <div style={{ 
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '0.9rem'
                        }}>
                            Loading...
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Add Button */}
            <div style={{
                position: 'fixed',
                bottom: '90px',
                right: '20px',
                zIndex: 1001,
                transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                transform: isButtonVisible ? 'translateY(0)' : 'translateY(100px)',
                opacity: isButtonVisible ? 1 : 0,
                pointerEvents: isButtonVisible ? 'auto' : 'none'
            }}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        width: '59px',
                        height: '59px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    +
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out',
                    pointerEvents: 'none'
                }}>
                    Add Document
                </div>
            </div>

            {/* Upload Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1002
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Upload New Document</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }}>Document Type</label>
                                <input
                                    type="text"
                                    value={formData.documentType}
                                    onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }}>Document Number</label>
                                <input
                                    type="text"
                                    value={formData.documentNumber}
                                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }}>Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expireDate}
                                    onChange={(e) => setFormData({...formData, expireDate: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            >
                                Upload Document
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyDocuments; 