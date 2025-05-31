import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

// Types
interface CustomField {
    id?: string;
    field_key: string;
    field_label: string;
    field_type: string;
    is_transaction_field: boolean;
    transaction_field_type?: string;
    transaction_value?: string | number;
}

// Dummy data for initial state
const dummyFields: CustomField[] = [
    {
        id: '1',
        field_key: 'tds',
        field_label: 'TDS',
        field_type: 'number',
        is_transaction_field: true,
        transaction_field_type: 'percentage',
        transaction_value: 2
    },
    {
        id: '2',
        field_key: 'gst',
        field_label: 'GST',
        field_type: 'number',
        is_transaction_field: true,
        transaction_field_type: 'percentage',
        transaction_value: 18
    },
    {
        id: '3',
        field_key: 'description',
        field_label: 'Description',
        field_type: 'text',
        is_transaction_field: false
    }
];

const CustomFieldsManager: React.FC = () => {
    const [fields, setFields] = useState<CustomField[]>(dummyFields);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<CustomField>({
        defaultValues: {
            field_key: '',
            field_label: '',
            field_type: 'text',
            is_transaction_field: false,
            transaction_field_type: '',
            transaction_value: ''
        }
    });

    const isTransactionField = watch('is_transaction_field');

    // Field type options
    const fieldTypes = [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'email', label: 'Email' },
        { value: 'date', label: 'Date' },
        { value: 'select', label: 'Select' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'checkbox', label: 'Checkbox' }
    ];

    // Transaction field types
    const transactionFieldTypes = [
        { value: '%', label: 'Percentage (%)' },
        { value: '*', label: 'Multiplier (*)' },
        { value: '+', label: 'Addition (+)' },
        { value: '-', label: 'Substraction (-)' },
        { value: '/', label: 'Division (/)' },
        { value: '=', label: 'Sum (=)' },
    ];


    // API call function (currently using dummy data)
    const saveField = async (fieldData: CustomField) => {
        try {
            setLoading(true);

            // Uncomment and modify this when ready to use real API
            // const response = await axios.post('http://localhost:4003/api/setting_config', fieldData);

            // For now, simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingField) {
                // Update existing field
                setFields(prev => prev.map(field =>
                    field.id === editingField.id ? { ...fieldData, id: editingField.id } : field
                ));
                setAlert({ type: 'success', message: 'Field updated successfully!' });
            } else {
                // Add new field
                const newField = { ...fieldData, id: Date.now().toString() };
                setFields(prev => [...prev, newField]);
                setAlert({ type: 'success', message: 'Field created successfully!' });
            }

            setIsDialogOpen(false);
            setEditingField(null);
        } catch (error) {
            setAlert({ type: 'error', message: 'Failed to save field. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field: CustomField) => {
        setEditingField(field);
        reset(field);
        setIsDialogOpen(true);
    };

    const handleDelete = async (fieldId: string) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            try {
                setLoading(true);

                // Uncomment when ready to use real API
                // await axios.delete(`http://localhost:4003/api/setting_config/${fieldId}`);

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));

                setFields(prev => prev.filter(field => field.id !== fieldId));
                setAlert({ type: 'success', message: 'Field deleted successfully!' });
            } catch (error) {
                setAlert({ type: 'error', message: 'Failed to delete field. Please try again.' });
            } finally {
                setLoading(false);
            }
        }
    };

    const onSubmit = (data: CustomField) => {
        saveField(data);
    };

    const handleAddNew = () => {
        setEditingField(null);
        reset({
            field_key: '',
            field_label: '',
            field_type: 'text',
            is_transaction_field: false,
            transaction_field_type: '',
            transaction_value: ''
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingField(null);
    };

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#2c3e50', fontWeight: 600, mb: 1 }}>
                    Custom Fields Manager
                </Typography>
                <Typography variant="body1" sx={{ color: '#6c757d' }}>
                    Create and manage custom fields with transaction field capabilities
                </Typography>
            </Box>

            {/* Alert */}
            {alert && (
                <Alert
                    severity={alert.type}
                    sx={{ mb: 3 }}
                    onClose={() => setAlert(null)}
                >
                    {alert.message}
                </Alert>
            )}

            {/* Left: Available Field Types */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>
                                Available Field Types
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {fieldTypes.map((type) => (
                                    <Chip
                                        key={type.value}
                                        label={type.label}
                                        variant="outlined"
                                        sx={{
                                            backgroundColor: '#e3f2fd',
                                            borderColor: '#2196f3',
                                            color: '#1976d2'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddNew}
                            sx={{
                                backgroundColor: '#28a745',
                                '&:hover': { backgroundColor: '#218838' },
                                textTransform: 'none',
                                px: 3,
                                height: 'fit-content' // keeps button aligned
                            }}
                        >
                            Add New Field
                        </Button>
                    </Box>
                </CardContent>
            </Card>


            {/* Fields Table */}
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
                        Custom Fields List
                    </Typography>

                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #dee2e6' }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                                <TableRow>
                                    <TableCell><strong>Field Key</strong></TableCell>
                                    <TableCell><strong>Label</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Transaction Field</strong></TableCell>
                                    <TableCell><strong>Transaction Type</strong></TableCell>
                                    <TableCell><strong>Value</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fields.map((field) => (
                                    <TableRow key={field.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#6f42c1' }}>
                                                {field.field_key}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{field.field_label}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={field.field_type}
                                                size="small"
                                                sx={{ backgroundColor: '#e9ecef', color: '#495057' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={field.is_transaction_field ? 'Yes' : 'No'}
                                                size="small"
                                                color={field.is_transaction_field ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {field.is_transaction_field ? (
                                                <Chip
                                                    label={field.transaction_field_type || '-'}
                                                    size="small"
                                                    sx={{ backgroundColor: '#fff3cd', color: '#856404' }}
                                                />
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {field.transaction_value || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(field)}
                                                sx={{ color: '#007bff', mr: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(field.id!)}
                                                sx={{ color: '#dc3545' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ backgroundColor: '#f8f9fa', color: '#495057' }}>
                        {editingField ? 'Edit Field' : 'Add New Field'}
                    </DialogTitle>

                    <DialogContent sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="field_key"
                                    control={control}
                                    rules={{ required: 'Field key is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Field Key"
                                            fullWidth
                                            error={!!errors.field_key}
                                            helperText={errors.field_key?.message}
                                            placeholder="e.g., tds"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="field_label"
                                    control={control}
                                    rules={{ required: 'Field label is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Field Label"
                                            fullWidth
                                            error={!!errors.field_label}
                                            helperText={errors.field_label?.message}
                                            placeholder="e.g., TDS"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="field_type"
                                    control={control}
                                    rules={{ required: 'Field type is required' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Field Type</InputLabel>
                                            <Select {...field} label="Field Type">
                                                {fieldTypes.map((type) => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="is_transaction_field"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    sx={{ color: '#28a745' }}
                                                />
                                            }
                                            label="Is Transaction Field"
                                        />
                                    )}
                                />
                            </Grid>

                            {isTransactionField && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="transaction_field_type"
                                            control={control}
                                            rules={isTransactionField ? { required: 'Transaction field type is required' } : {}}
                                            render={({ field }) => (
                                                <FormControl fullWidth>
                                                    <InputLabel>Transaction Field Type</InputLabel>
                                                    <Select {...field} label="Transaction Field Type">
                                                        {transactionFieldTypes.map((type) => (
                                                            <MenuItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="transaction_value"
                                    control={control}
                                    rules={isTransactionField ? { required: 'value is required' } : {}}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Value"
                                            type="number"
                                            fullWidth
                                            error={!!errors.transaction_value}
                                            helperText={errors.transaction_value?.message}
                                            placeholder="e.g., 2"
                                        />
                                    )}
                                />
                            </Grid>

                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                        <Button
                            onClick={handleCloseDialog}
                            startIcon={<CancelIcon />}
                            sx={{ color: '#6c757d' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                            sx={{
                                backgroundColor: '#007bff',
                                '&:hover': { backgroundColor: '#0056b3' }
                            }}
                        >
                            {loading ? 'Saving...' : (editingField ? 'Update Field' : 'Create Field')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default CustomFieldsManager;