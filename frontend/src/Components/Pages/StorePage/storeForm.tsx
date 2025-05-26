import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import {
    ArrowBack,
    Clear,
    Save
} from '@mui/icons-material';

type Company = { id: number; name?: string; company_name?: string };

interface StoreFormProps {
    onClose: () => void;
    onSubmit: (formData: any) => void;
    initialData: any;
    companies: Company[];
}

const StoreForm: React.FC<StoreFormProps> = ({ onClose, onSubmit, initialData, companies }) => {
    const [formData, setFormData] = useState<any>({
        company_id: '',
        store_name: '',
        location: '',
        address: '',
        contact_person: '',
        contact_phone: '',
        status: 'active',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<{ value: unknown } | HTMLInputElement>) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: (event.target as HTMLInputElement).value,
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.company_id) newErrors.company_id = 'Company is required';
        if (!formData.store_name?.trim()) newErrors.store_name = 'Store name is required';
        if (formData.contact_phone && !/^[\+]?[1-9][\d\s\-\(\)]{7,}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
            newErrors.contact_phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                onSubmit(formData);
                setSnackbar({ open: true, message: `Store ${initialData ? 'updated' : 'created'} successfully!`, severity: 'success' });
                setTimeout(() => { onClose(); }, 1500);
            } catch (error) {
                setSnackbar({ open: true, message: 'Error saving store. Please try again.', severity: 'error' });
            }
        }
    };

    const handleClear = () => {
        setFormData({ company_id: '', store_name: '', location: '', address: '', contact_person: '', contact_phone: '', status: 'active' });
        setErrors({});
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={onClose} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {initialData ? 'Edit Store' : 'Add New Store'}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Company Selection */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.company_id}>
                                <InputLabel>Company *</InputLabel>
                                <Select
                                    value={formData.company_id}
                                    onChange={handleInputChange('company_id')}
                                    label="Company *"
                                >
                                    {companies && companies.length > 0 ? (
                                        companies.map((company) => (
                                            <MenuItem key={company.id} value={company.id}>
                                                {company.company_name || company.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            No companies found
                                        </MenuItem>
                                    )}
                                </Select>
                                {errors.company_id && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                        {errors.company_id}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Store Name */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Store Name"
                                value={formData.store_name}
                                onChange={handleInputChange('store_name')}
                                error={!!errors.store_name}
                                helperText={errors.store_name}
                                required
                            />
                        </Grid>

                        {/* Location */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={formData.location}
                                onChange={handleInputChange('location')}
                                helperText="City, State or Region"
                            />
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={handleInputChange('status')}
                                    label="Status"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Address */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                value={formData.address}
                                onChange={handleInputChange('address')}
                                multiline
                                rows={3}
                                helperText="Complete address including street, city, state, and postal code"
                            />
                        </Grid>

                        {/* Contact Person */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Contact Person"
                                value={formData.contact_person}
                                onChange={handleInputChange('contact_person')}
                            />
                        </Grid>

                        {/* Contact Phone */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Contact Phone"
                                value={formData.contact_phone}
                                onChange={handleInputChange('contact_phone')}
                                error={!!errors.contact_phone}
                                helperText={errors.contact_phone}
                            />
                        </Grid>


                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                name="custom_latitude"
                                value={formData.custom_latitude}
                                onChange={handleInputChange('custom_latitude')}
                                onKeyDown={(e) => {
                                    const key = e.key;
                                    const allowedSpecialKeys = [
                                        "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", ".", "End", "Home"
                                    ];
                                    const ctrlCombination = e.ctrlKey && ["c", "x", "z", "v"].includes(key.toLowerCase());
                                    if (!allowedSpecialKeys.includes(key) && isNaN(parseInt(key)) && !ctrlCombination) {
                                        e.preventDefault();
                                    }
                                }}
                                error={!!errors.custom_latitude}
                                helperText={errors.custom_latitude}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                name="custom_longitude"
                                value={formData.custom_longitude}
                                onChange={handleInputChange('custom_longitude')}
                                onKeyDown={(e) => {
                                    const key = e.key;
                                    const allowedSpecialKeys = [
                                        "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", ".", "End", "Home"
                                    ];
                                    const ctrlCombination = e.ctrlKey && ["c", "x", "z", "v"].includes(key.toLowerCase());
                                    if (!allowedSpecialKeys.includes(key) && isNaN(parseInt(key)) && !ctrlCombination) {
                                        e.preventDefault();
                                    }
                                }}
                                error={!!errors.custom_longitude}
                                helperText={errors.custom_longitude}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Radius"
                                name="custom_radius"
                                value={formData.custom_radius}
                                onChange={handleInputChange('custom_radius')}
                                error={!!errors.custom_radius}
                                helperText={errors.custom_radius}
                            />
                        </Grid>



                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        mt: 4,
                        pt: 3,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleClear}
                            startIcon={<Clear />}
                            sx={{ minWidth: 120 }}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{ minWidth: 120 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<Save />}
                            sx={{
                                minWidth: 120,
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            {initialData ? 'Update Store' : 'Create Store'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default StoreForm;