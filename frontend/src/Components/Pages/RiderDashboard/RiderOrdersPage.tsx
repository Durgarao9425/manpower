import React, { useState } from "react";
import {
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    Divider,
    useTheme as useMuiTheme,
    useMediaQuery,
    Stack,
    Chip
} from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowBack,
    Close
} from '@mui/icons-material';
import { DateFilter } from "./DateFilter";
import { InfoCard } from "./TablePannel";

interface CardData {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
}

interface AdvanceRequestData {
    totalOrders: number;
    totalEarnings: number;
    maxAdvancePercentage: number;
    maxAdvanceAmount: number;
    alreadyRequested: number;
    remainingEligible: number;
}

export const Orders: React.FC = () => {
    const muiTheme = useMuiTheme();
    const { themeColor } = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [requestAmount, setRequestAmount] = useState('');
    const [remarks, setRemarks] = useState('');

    const advanceData: AdvanceRequestData = {
        totalOrders: 500,
        totalEarnings: 20000,
        maxAdvancePercentage: 70,
        maxAdvanceAmount: 14000,
        alreadyRequested: 0,
        remainingEligible: 14000
    };

    const orderCards: CardData[] = [
        { title: 'Total Orders', value: 45, color: themeColor },
        { title: 'Weekly Earnings', value: '₹8,750', color: themeColor },
        { title: 'Advance Request', value: '₹2,000', color: themeColor },
        { title: 'Advance Paid', value: '₹1,500', color: themeColor },
        { title: 'Advance Pending', value: '₹500', color: themeColor },
        { title: 'Due Amount', value: '₹300', color: themeColor },
    ];

    const handleFilter = () => {
        console.log('Filtering data from', startDate, 'to', endDate);
    };

    const handleAdvanceCardClick = (cardTitle: string) => {
        if (cardTitle === 'Advance Request') {
            setDrawerOpen(true);
        }
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setRequestAmount('');
        setRemarks('');
    };

    const handleSubmitRequest = async () => {
        try {
            // API call would go here
            const requestData = {
                amount: parseFloat(requestAmount),
                remarks: remarks,
                dateRange: '2025-05-22 to 2025-05-31'
            };
            console.log('Submitting request:', requestData);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Advance request submitted successfully!');
            handleCloseDrawer();
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error submitting request. Please try again.');
        }
    };

    return (
        <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Orders Overview
            </h3>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {orderCards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => handleAdvanceCardClick(card.title)}
                        style={{ cursor: card.title === 'Advance Request' ? 'pointer' : 'default' }}
                    >
                        <InfoCard {...card} />
                    </div>
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

            {/* Advance Request Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : '500px',
                        maxWidth: '100%'
                    }
                }}
            >
                {/* Header */}
                <AppBar position="static" elevation={1} sx={{ backgroundColor: themeColor, color: 'white' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            onClick={handleCloseDrawer}
                            sx={{ mr: 2 }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Request Advance Payment
                        </Typography>
                        <IconButton onClick={handleCloseDrawer}>
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                {/* Content */}
                <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Request advance for all uploaded orders this week:
                    </Typography>

                    <Box sx={{ my: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Orders from 2025-05-22 to 2025-05-31
                        </Typography>
                    </Box>

                    <Stack spacing={3}>
                        {/* Order Summary */}
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body1">Total Orders</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {advanceData.totalOrders}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body1">Total Earnings</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    ₹{advanceData.totalEarnings.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1">Max Advance</Typography>
                                    <Chip
                                        label={`${advanceData.maxAdvancePercentage}%`}
                                        size="small"
                                        sx={{ 
                                            backgroundColor: themeColor,
                                            color: 'white'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: themeColor }}>
                                    ₹{advanceData.maxAdvanceAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body1">Already Requested</Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    ₹{advanceData.alreadyRequested.toFixed(2)}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1" fontWeight="bold">Remaining Eligible</Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: themeColor }}>
                                    ₹{advanceData.remainingEligible.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Request Form */}
                        <Box>
                            <Typography variant="body1" gutterBottom fontWeight="medium">
                                Amount to Request
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Enter amount"
                                value={requestAmount}
                                onChange={(e) => setRequestAmount(e.target.value)}
                                type="number"
                                inputProps={{
                                    max: advanceData.remainingEligible,
                                    min: 0,
                                    step: 0.01
                                }}
                                helperText={`Maximum amount: ₹${advanceData.remainingEligible.toFixed(2)}`}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="body1" gutterBottom fontWeight="medium">
                                Remarks (Optional)
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Add any remarks..."
                                multiline
                                rows={4}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </Box>
                    </Stack>
                </Box>

                {/* Footer */}
                <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCloseDrawer}
                            sx={{ 
                                fontSize: '10px',
                                color: themeColor,
                                borderColor: themeColor,
                                '&:hover': {
                                    borderColor: themeColor,
                                    backgroundColor: `${themeColor}10`
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSubmitRequest}
                            sx={{ 
                                fontSize: '13px',
                                backgroundColor: themeColor,
                                '&:hover': {
                                    backgroundColor: `${themeColor}dd`
                                }
                            }}
                            disabled={!requestAmount || parseFloat(requestAmount) <= 0 || parseFloat(requestAmount) > advanceData.remainingEligible}
                        >
                            Submit Request
                        </Button>
                    </Stack>
                </Box>
            </Drawer>
        </div>
    );
};