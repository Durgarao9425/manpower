import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';

interface Company {
  id?: number;
  user_id?: number;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_gst?: string;
  company_address?: string;
  industry?: string;
  logo?: string;
  created_by?: number;
  payment_terms?: number;
}

const defaultForm: Company = {
  company_name: '',
  company_email: '',
  company_phone: '',
  company_gst: '',
  company_address: '',
  industry: '',
  logo: '',
  payment_terms: 7
};

const CompanyForm = ({ open, onClose, onSave, company }: any) => {
  const [form, setForm] = useState<Company>(defaultForm);
  useEffect(() => {
    if (company) setForm(company);
    else setForm(defaultForm);
  }, [company]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Company Name" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Email" value={form.company_email} onChange={e => setForm(f => ({ ...f, company_email: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Phone" value={form.company_phone} onChange={e => setForm(f => ({ ...f, company_phone: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="GST" value={form.company_gst} onChange={e => setForm(f => ({ ...f, company_gst: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Address" value={form.company_address} onChange={e => setForm(f => ({ ...f, company_address: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Industry" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Logo URL" value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} sx={{ my: 1 }} />
        <TextField fullWidth label="Payment Terms" type="number" value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: Number(e.target.value) }))} sx={{ my: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained">{company ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const CompanyPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  const fetchCompanies = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:4003/api/companies');
    const data = await res.json();
    setCompanies(data);
    setLoading(false);
  };
  useEffect(() => { fetchCompanies(); }, []);

  const handleSave = async (company: Company) => {
    // Ensure required fields for backend
    const payload = {
      ...company,
      created_by: 1, // Set to 1 or current user id
      payment_terms: company.payment_terms || 7
    };
    if (company.id) {
      // Edit
      const res = await fetch(`http://localhost:4003/api/companies/${company.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSnackbar({ open: true, msg: 'Company updated', type: 'success' });
        fetchCompanies();
      } else setSnackbar({ open: true, msg: 'Failed to update', type: 'error' });
    } else {
      // Create
      const res = await fetch('http://localhost:4003/api/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSnackbar({ open: true, msg: 'Company created', type: 'success' });
        fetchCompanies();
      } else setSnackbar({ open: true, msg: 'Failed to create', type: 'error' });
    }
    setOpenForm(false);
    setEditCompany(null);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:4003/api/companies/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSnackbar({ open: true, msg: 'Company deleted', type: 'success' });
      fetchCompanies();
    } else setSnackbar({ open: true, msg: 'Failed to delete', type: 'error' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, minWidth: '77vw' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Company Listings</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenForm(true)}>Add Company</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Industry</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map(company => (
              <TableRow key={company.id}>
                <TableCell>{company.id}</TableCell>
                <TableCell>{company.company_name}</TableCell>
                <TableCell>{company.company_email}</TableCell>
                <TableCell>{company.company_phone}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => { setEditCompany(company); setOpenForm(true); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(company.id!)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CompanyForm open={openForm} onClose={() => { setOpenForm(false); setEditCompany(null); }} onSave={handleSave} company={editCompany} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CompanyPage;
