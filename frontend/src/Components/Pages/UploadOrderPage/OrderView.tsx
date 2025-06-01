import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Container,
    Chip,
    Divider,
    Stack,
    Paper,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    GetApp as GetAppIcon,
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface OrderStatement {
    id: number;
    company_id: string;
    payment_date: string;
    start_date: string;
    end_date: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    file_path: string;
    notes: string;
    mapping_status: string;
    period?: string;
    submitted?: string;
    lastUpdated?: string;
    rider?: string;
    phone?: string;
    company?: string;
    role?: string;
}

const OrderView = ({ setCurrentComponent }: { setCurrentComponent: (component: string) => void }) => {
    const { id } = useParams();
    const [order, setOrder] = useState<OrderStatement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            // const response = await axios.get(`/api/orders/weekly-orders/${id}`);
            // setOrder(response.data);

            // Mock data
            setTimeout(() => {
                const mockOrder = {
                    id: 38,
                    company_id: '1',
                    payment_date: '2025-05-23',
                    start_date: '2025-05-22',
                    end_date: '2025-05-31',
                    amount: 0.00,
                    status: 'pending',
                    file_path: '/uploads/order_38.xlsx',
                    notes: 'Initial upload for May period',
                    mapping_status: 'mapped',
                    period: 'May 22 - May 31',
                    submitted: 'May 23, 2025',
                    lastUpdated: 'May 23, 2025',
                    rider: 'Angelique Morse',
                    phone: '+46 8 123 456',
                    company: 'Big Basket',
                    role: 'Content Creator'
                };
                setOrder(mockOrder);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching order:', error);
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!order) return;
        try {
            const link = document.createElement('a');
            link.href = order.file_path;
            link.download = `order_statement_${order.id}.xlsx`;
            link.click();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'completed': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h6" color="error">Order not found</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setCurrentComponent('OrdersList')}
                    sx={{ mr: 2 }}
                >
                    Back to Orders
                </Button>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setCurrentComponent('OrderFormEdit')}
                        sx={{ mr: 2 }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<GetAppIcon />}
                        onClick={handleDownload}
                    >
                        Download
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssignmentIcon color="primary" />
                                Order Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                                    <Typography variant="body1" fontWeight="bold">#{order.id}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                                    <Typography variant="body1">{order.company}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Period</Typography>
                                    <Typography variant="body1">{order.period}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                                    <Typography variant="h6" color="primary">₹{order.amount.toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={order.status.toUpperCase()}
                                        color={getStatusColor(order.status) as any}
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AssessmentIcon color="secondary" />
                                Timeline
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                                    <Typography variant="body1">{order.submitted}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                    <Typography variant="body1">{order.lastUpdated}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Payment Date</Typography>
                                    <Typography variant="body1">{new Date(order.payment_date).toLocaleDateString()}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Mapping Status</Typography>
                                    <Chip
                                        label={order.mapping_status.toUpperCase()}
                                        color={order.mapping_status === 'completed' ? 'success' :
                                            order.mapping_status === 'processing' ? 'info' :
                                                order.mapping_status === 'failed' ? 'error' : 'default'}
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon color="success" />
                                Rider Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Rider Name</Typography>
                                    <Typography variant="body1">{order.rider}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                                    <Typography variant="body1">{order.phone}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                                    <Typography variant="body1">{order.role}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GetAppIcon color="info" />
                                Documents & Notes
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Uploaded Document</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<GetAppIcon />}
                                            onClick={handleDownload}
                                        >
                                            Download Excel File
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        File: order_statement_{order.id}.xlsx
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                                        <Typography variant="body2">
                                            {order.notes || 'No notes available'}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Status History
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ pl: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: getStatusColor(order.status) === 'success' ? 'success.main' :
                                            getStatusColor(order.status) === 'warning' ? 'warning.main' :
                                                getStatusColor(order.status) === 'info' ? 'info.main' : 'error.main',
                                        mr: 2
                                    }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {order.status.toUpperCase()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.lastUpdated}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, opacity: 0.7 }}>
                                    <Box sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: 'grey.400',
                                        mr: 2
                                    }} />
                                    <Box>
                                        <Typography variant="body2">
                                            SUBMITTED
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.submitted}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default OrderView;