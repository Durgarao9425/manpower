import { useEffect, useState } from "react";
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
  Alert,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import apiService from "../../../services/apiService";

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
  company_name: "",
  company_email: "",
  company_phone: "",
  company_gst: "",
  company_address: "",
  industry: "",
  logo: "",
  payment_terms: 7,
};

const CompanyForm = ({ open, onClose, onSave, company }: any) => {
  const [form, setForm] = useState<Company>(defaultForm);
  useEffect(() => {
    if (company) setForm(company);
    else setForm(defaultForm);
  }, [company]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{company ? "Edit Company" : "Add Company"}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Company Name"
          value={form.company_name}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, company_name: e.target.value }))
          }
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Email"
          value={form.company_email}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, company_email: e.target.value }))
          }
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Phone"
          value={form.company_phone}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, company_phone: e.target.value }))
          }
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="GST"
          value={form.company_gst}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, company_gst: e.target.value }))
          }
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Address"
          value={form.company_address}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, company_address: e.target.value }))
          }
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Industry"
          value={form.industry}
          onChange={(e) => setForm((f: Company) => ({ ...f, industry: e.target.value }))}
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Logo URL"
          value={form.logo}
          onChange={(e) => setForm((f: Company) => ({ ...f, logo: e.target.value }))}
          sx={{ my: 1 }}
        />
        <TextField
          fullWidth
          label="Payment Terms"
          type="number"
          value={form.payment_terms}
          onChange={(e) =>
            setForm((f: Company) => ({ ...f, payment_terms: Number(e.target.value) }))
          }
          sx={{ my: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained">
          {company ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CompanyPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error";
  }>({ open: false, msg: "", type: "success" });

  const fetchCompanies = async () => {
    try {
      const data = await apiService.get("/companies");
      setCompanies(data);
    } catch (err) {
      setCompanies([]);
    }
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSave = async (company: Company) => {
    // Ensure required fields for backend
    const payload = {
      ...company,
      created_by: 1, // Set to 1 or current user id
      payment_terms: company.payment_terms || 7,
    };
    try {
      if (company.id) {
        // Edit
        await apiService.put(`/companies/${company.id}`, payload);
        setSnackbar({ open: true, msg: "Company updated", type: "success" });
        fetchCompanies();
      } else {
        // Create
        await apiService.post("/companies", payload);
        setSnackbar({ open: true, msg: "Company created", type: "success" });
        fetchCompanies();
      }
    } catch (err) {
      setSnackbar({
        open: true,
        msg: company.id ? "Failed to update" : "Failed to create",
        type: "error",
      });
    }
    setOpenForm(false);
    setEditCompany(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.delete(`/companies/${id}`);
      setSnackbar({ open: true, msg: "Company deleted", type: "success" });
      fetchCompanies();
    } catch (err) {
      setSnackbar({ open: true, msg: "Failed to delete", type: "error" });
    }
  };

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", width: "78vw" }}>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 4 },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1" fontWeight={600}>
            Company Listings{" "}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setOpenForm(true)}
            sx={{
              px: 2.5,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              borderRadius: 2,
              transition: "all 0.3s ease",
              boxShadow: 2,
              ":hover": {
                backgroundColor: "#1976d2", // deeper blue on hover
                boxShadow: 4,
                transform: "scale(1.03)",
              },
            }}
          >
            Add New User
          </Button>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            overflowX: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Table
            sx={{
              tableLayout: "fixed",
              borderCollapse: "collapse",
              width: "100%",
            }}
            size="small"
            aria-label="companies table"
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {[
                  { label: "ID", width: "60px" },
                  { label: "Name", width: "180px" },
                  { label: "Email", width: "240px" },
                  { label: "Phone", width: "160px" },
                  { label: "Industry", width: "160px" },
                  { label: "Actions", width: "120px" },
                ].map((column, index) => (
                  <TableCell
                    key={column.label}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#424242",
                      padding: "10px 16px",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: index !== 5 ? "1px solid #e0e0e0" : "none",
                      width: column.width,
                      maxWidth: column.width,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {companies.map((company: Company) => (
                <TableRow
                  key={company.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#fafafa",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                      "&:last-child": { borderRight: "none" },
                      // cursor: column.clickable ? "pointer" : "default",
                    }}
                  >
                    {company.id}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {company.company_name}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {company.company_email}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {company.company_phone}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {company.industry}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => {
                          setEditCompany(company);
                          setOpenForm(true);
                        }}
                        size="small"
                        sx={{
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                          },
                        }}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => company.id !== undefined && handleDelete(company.id)}
                        size="small"
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                          },
                        }}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <CompanyForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditCompany(null);
          }}
          onSave={handleSave}
          company={editCompany}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s: any) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CompanyPage;
