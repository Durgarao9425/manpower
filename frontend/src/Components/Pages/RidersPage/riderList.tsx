import React, { useState, useEffect } from "react";
import RiderRegistrationForm from "./Riderform";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  DirectionsBike as BikeIcon,
  HealthAndSafety as InsuranceIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CardData } from "../RiderDashboard/types";
import {
  ReusableListingPage,
  type ActionButton,
  type Column,
  type FilterField,
  type RowAction,
  type TabData,
} from "../../Common/ReusableList";

interface Rider {
  id: number;
  rider_id: string;
  user_id: string;
  rider_code: string;
  id_proof: string;
  emergency_contact: string;
  date_of_birth: string;
  blood_group: string;
  joining_date: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  upi_id: string;
  id_card_path: string;
  performance_tier: string;
  last_certificate_date: string;
  created_by: number;
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiry_date: string;
  documents: any[];
  status: string;
  vehicle_type: string;
  vehicle_number: string;
}

interface Company {
  id: number;
  company_name: string;
}

interface Store {
  id: number;
  store_name: string;
  company_id: number;
}

interface Stats {
  totalRiders: number;
  activeRiders: number;
  topPerformers: number;
  totalDeliveries: number;
}

const RiderListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRiders: 0,
    activeRiders: 0,
    topPerformers: 0,
    totalDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [companyRiderId, setCompanyRiderId] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // Insurance dialog state
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [insuranceData, setInsuranceData] = useState({
    provider_name: "",
    insurance_number: "",
    activation_date: "",
    status: "active",
    document_file: null as File | null,
  });
  const [insuranceSuccess, setInsuranceSuccess] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchRiders();
    fetchCompanies();
    fetchStores();
  }, []);

  // Load stores when company is selected
  useEffect(() => {
    if (selectedCompany) {
      console.log("Loading stores for company ID:", selectedCompany);
      fetchStoresByCompany(selectedCompany);
    } else {
      console.log("No company selected, clearing stores");
      setStores([]);
    }
  }, [selectedCompany]);

  // API Functions
  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/riders");
      setRiders(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Error fetching riders:", error);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get("/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await api.get("/stores");
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchStoresByCompany = async (companyId: string) => {
    try {
      console.log(`Fetching stores for company ID: ${companyId}`);
      const response = await api.get(`/stores?company_id=${companyId}`);
      console.log("Stores response:", response.data);

      if (Array.isArray(response.data)) {
        setStores(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Handle case where API returns { data: [...] }
        setStores(response.data.data);
      } else {
        console.warn("Unexpected stores response format:", response.data);
        setStores([]);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
    }
  };

  const calculateStats = (ridersData: Rider[]) => {
    const totalRiders = ridersData.length;
    const activeRiders = ridersData.filter(
      (rider) => rider.status === "Active"
    ).length;
    const topPerformers = ridersData.filter(
      (rider) => rider.performance_tier === "high"
    ).length;
    const totalDeliveries = 2485; // This should come from API

    setStats({
      totalRiders,
      activeRiders,
      topPerformers,
      totalDeliveries,
    });
  };

  // Action handlers
  const handleEdit = (rider: Rider) => {
    navigate(`/riders/edit/${rider.id}`);
  };

  const handleDelete = async (rider: Rider) => {
    if (window.confirm("Are you sure you want to delete this rider?")) {
      try {
        await api.delete(`/riders/${rider.id}`);
        fetchRiders();
      } catch (error) {
        console.error("Error deleting rider:", error);
      }
    }
  };

  const handleAssign = async (rider: Rider) => {
    setSelectedRider(rider);
    try {
      const res = await api.get(`/rider-assignments/by-rider/${rider.id}`);
      console.log("Rider assignment response:", res.data);

      if (res.data.success && res.data.data) {
        // Handle both single object and array response formats
        const assignment = Array.isArray(res.data.data)
          ? res.data.data[0]
          : res.data.data;

        if (assignment) {
          // Convert to string to ensure compatibility with Select component
          setSelectedCompany(assignment.company_id?.toString() || "");
          setSelectedStore(assignment.store_id?.toString() || "");
          setCompanyRiderId(assignment.company_rider_id || "");
          console.log("Found assignment:", {
            company_id: assignment.company_id,
            store_id: assignment.store_id,
            company_rider_id: assignment.company_rider_id,
          });
        } else {
          setSelectedCompany("");
          setSelectedStore("");
          setCompanyRiderId("");
          console.warn("No assignment data found in response");
        }
      } else {
        setSelectedCompany("");
        setSelectedStore("");
        setCompanyRiderId("");
        console.warn("No active assignment found for the rider.");
      }
    } catch (err) {
      console.error("Error fetching rider assignment:", err);
      setSelectedCompany("");
      setSelectedStore("");
      setCompanyRiderId("");
    }
    setAssignDialogOpen(true);
  };

  const handleInsurance = (rider: Rider) => {
    setSelectedRider(rider);
    // Reset insurance form data
    setInsuranceData({
      provider_name: "",
      insurance_number: "",
      activation_date: "",
      status: "active",
      document_file: null,
    });
    setInsuranceDialogOpen(true);
  };

  const handleInsuranceSubmit = async () => {
    if (!selectedRider) {
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("rider_id", selectedRider.id.toString());
      formData.append("provider_name", insuranceData.provider_name);
      formData.append("insurance_number", insuranceData.insurance_number);
      formData.append("activation_date", insuranceData.activation_date);
      formData.append("status", insuranceData.status);

      if (insuranceData.document_file) {
        formData.append("document_file", insuranceData.document_file);
      }

      // This is a placeholder - you would need to create an API endpoint for this
      // await api.post('/rider-insurance', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      console.log("Insurance data submitted:", {
        rider_id: selectedRider.id,
        ...insuranceData,
      });

      setInsuranceSuccess("Insurance information saved successfully!");
      setTimeout(() => {
        setInsuranceDialogOpen(false);
        setInsuranceSuccess("");
        setSelectedRider(null);
      }, 2000);
    } catch (error) {
      console.error("Error saving insurance information:", error);
      alert("Failed to save insurance information. Please try again.");
    }
  };

  const handleInsuranceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInsuranceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInsuranceFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setInsuranceData((prev) => ({
        ...prev,
        document_file: e.target.files![0],
      }));
    }
  };

  const handleAssignSubmit = async () => {
    if (
      !selectedRider ||
      !selectedCompany ||
      !selectedStore ||
      !companyRiderId
    ) {
      console.warn("Missing required fields for rider assignment");
      return;
    }

    try {
      console.log("Submitting assignment data:", {
        rider_id: selectedRider.id,
        company_id: selectedCompany,
        store_id: selectedStore,
        company_rider_id: companyRiderId,
      });

      await api.post("/rider-assignments", {
        rider_id: selectedRider.id,
        company_id: selectedCompany,
        store_id: selectedStore,
        company_rider_id: companyRiderId,
      });

      setAssignDialogOpen(false);
      setSelectedCompany("");
      setSelectedStore("");
      setSelectedRider(null);
      setCompanyRiderId("");
      setAssignSuccess("Rider assigned successfully!");
      setTimeout(() => setAssignSuccess(""), 3000);

      // Refresh rider data to show updated assignments
      fetchRiders();
    } catch (error) {
      console.error("Error assigning rider:", error);
      alert("Failed to assign rider. Please try again.");
    }
  };

  // Helper functions
  const getPerformanceColor = (tier: string) => {
    switch (tier) {
      case "high":
        return "success";
      case "medium":
        return "warning";
      case "low":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "error";
  };

  // Configuration for ReusableListingPage
  const cardData: CardData[] = [
    {
      title: "Total Riders",
      value: stats.totalRiders,
      color: "#667eea",
      icon: <PersonIcon />,
    },
    {
      title: "Active Riders",
      value: stats.activeRiders,
      color: "#f093fb",
      icon: <CheckCircleIcon />,
    },
    {
      title: "Top Performers",
      value: stats.topPerformers,
      color: "#4facfe",
      icon: <StarIcon />,
    },
    {
      title: "Total Deliveries",
      value: stats.totalDeliveries,
      color: "#fa709a",
      icon: <BikeIcon />,
    },
  ];

  const tabs: TabData[] = [
    { label: "All Riders", value: "all", count: riders.length },
    {
      label: "Active",
      value: "Active",
      count: riders.filter((r) => r.status === "Active").length,
      color: "success",
    },
    {
      label: "Inactive",
      value: "Inactive",
      count: riders.filter((r) => r.status === "Inactive").length,
      color: "error",
    },
  ];

  const columns: Column[] = [
    {
      field: "rider_info",
      headerName: "Rider",
      width: "22%",
      minWidth: 220,
      render: (_, rider: Rider) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ mr: 2, bgcolor: "#1976d2", width: 40, height: 40 }}>
            {rider.account_holder_name?.charAt(0) ||
              rider.rider_code?.charAt(0) ||
              "R"}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {rider.account_holder_name || "N/A"}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ID: {rider.rider_code}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "contact",
      headerName: "Contact",
      width: "14%",
      minWidth: 130,
      render: (_, rider: Rider) => (
        <Box>
          <Typography variant="body2">
            {rider.emergency_contact || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: "10%",
      minWidth: 100,
      render: (_, rider: Rider) => (
        <Chip
          label={rider.status}
          color={getStatusColor(rider.status) as any}
          size="small"
        />
      ),
    },
    {
      field: "joining_date",
      headerName: "Joined",
      width: "12%",
      minWidth: 110,
      render: (_, rider: Rider) => (
        <Typography variant="body2">
          {rider.joining_date
            ? new Date(rider.joining_date).toLocaleDateString()
            : "N/A"}
        </Typography>
      ),
    },
    {
      field: "bank_details",
      headerName: "Bank Details",
      width: "18%",
      minWidth: 170,
      render: (_, rider: Rider) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {rider.bank_name || "N/A"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {rider.account_number
              ? `****${rider.account_number.slice(-4)}`
              : "N/A"}
          </Typography>
        </Box>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      field: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "All Status" },
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    {
      field: "performance_tier",
      label: "Performance",
      type: "select",
      options: [
        { value: "all", label: "All Performance" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      field: "vehicle_type",
      label: "Vehicle Type",
      type: "select",
      options: [
        { value: "all", label: "All Vehicles" },
        { value: "bike", label: "Bike" },
        { value: "scooter", label: "Scooter" },
        { value: "bicycle", label: "Bicycle" },
      ],
    },
  ];

  const actionButtons: ActionButton[] = [
    {
      label: "Add New Rider",
      icon: <AddIcon />,
      color: "primary",
      onClick: () => setShowRegistrationForm(true),
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View",
      icon: <VisibilityIcon />,
      color: "info",
      onClick: (rider) => navigate(`/riders/view/${rider.id}`),
    },
    {
      label: "Edit",
      icon: <EditIcon />,
      color: "primary",
      onClick: handleEdit,
    },
    {
      label: "Insurance",
      icon: <InsuranceIcon />,
      color: "info",
      onClick: handleInsurance,
    },
    {
      label: "Assign",
      icon: <AssignmentIcon />,
      color: "secondary",
      onClick: handleAssign,
    },
    {
      label: "Delete",
      icon: <DeleteIcon />,
      color: "error",
      onClick: handleDelete,
    },
  ];

  const handleCloseDialog = () => {
    setAssignDialogOpen(false);
    setSelectedRider(null);
    setSelectedCompany("");
    setSelectedStore("");
    setCompanyRiderId("");
  };

  const handleCompanyChange = (event: SelectChangeEvent) => {
    const companyId = event.target.value;
    console.log("Selected company ID:", companyId);
    setSelectedCompany(companyId);
    setSelectedStore(""); // Reset store when company changes

    // Fetch stores for this company
    if (companyId) {
      fetchStoresByCompany(companyId);
    }
  };

  const handleStoreChange = (event: SelectChangeEvent) => {
    const storeId = event.target.value;
    console.log("Selected store ID:", storeId);
    setSelectedStore(storeId);
  };

  if (showRegistrationForm) {
    return (
      <RiderRegistrationForm
        onClose={() => setShowRegistrationForm(false)}
        onSuccess={() => {
          setShowRegistrationForm(false);
          fetchRiders();
        }}
      />
    );
  }

  return (
    <>
      <ReusableListingPage
        title="Rider Management"
        data={riders}
        columns={columns}
        cardData={cardData}
        tabs={tabs}
        filterFields={filterFields}
        actionButtons={actionButtons}
        rowActions={rowActions}
        loading={loading}
        searchFields={[
          "account_holder_name",
          "rider_code",
          "emergency_contact",
          "vehicle_number",
        ]}
        defaultSortField="id"
        defaultSortOrder="desc"
      />

      {/* Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Rider to Store</DialogTitle>
        <DialogContent>
          {selectedRider && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rider: {selectedRider.account_holder_name} (
                {selectedRider.rider_code})
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany}
              onChange={handleCompanyChange}
              label="Company"
              displayEmpty
            >
              <MenuItem value="">Select Company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id.toString()}>
                  {company.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCompany}>
            <InputLabel>Store</InputLabel>
            <Select
              value={selectedStore}
              onChange={handleStoreChange}
              label="Store"
              displayEmpty
            >
              <MenuItem value="">Select Store</MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id.toString()}>
                  {store.store_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Company Rider ID"
            value={companyRiderId}
            onChange={(e) => setCompanyRiderId(e.target.value)}
            placeholder="Enter company-specific rider ID"
            sx={{ mb: 2 }}
          />

          {assignSuccess && (
            <Typography color="success.main" variant="body2">
              {assignSuccess}
            </Typography>
          )}

          {/* Debug info - can be removed in production */}
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: "grey.100",
              borderRadius: 1,
              display: "none",
            }}
          >
            <Typography variant="caption" component="div">
              Debug Info:
            </Typography>
            <Typography variant="caption" component="div">
              Company ID: {selectedCompany}
            </Typography>
            <Typography variant="caption" component="div">
              Store ID: {selectedStore}
            </Typography>
            <Typography variant="caption" component="div">
              Company Rider ID: {companyRiderId}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            disabled={!selectedCompany || !selectedStore || !companyRiderId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insurance Dialog */}
      <Dialog
        open={insuranceDialogOpen}
        onClose={() => setInsuranceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rider Insurance Information</DialogTitle>
        <DialogContent>
          {selectedRider && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rider: {selectedRider.account_holder_name} (
                {selectedRider.rider_code})
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Insurance Provider Name"
            name="provider_name"
            value={insuranceData.provider_name}
            onChange={handleInsuranceChange}
            placeholder="Enter insurance provider name"
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            fullWidth
            label="Insurance Number"
            name="insurance_number"
            value={insuranceData.insurance_number}
            onChange={handleInsuranceChange}
            placeholder="Enter insurance policy number"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Activation Date"
            name="activation_date"
            type="date"
            value={insuranceData.activation_date}
            onChange={handleInsuranceChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Insurance Status</InputLabel>
            <Select
              name="status"
              value={insuranceData.status}
              onChange={(e) =>
                setInsuranceData((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              label="Insurance Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
            Upload Insurance Document
            <input type="file" hidden onChange={handleInsuranceFileChange} />
          </Button>

          {insuranceData.document_file && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected file: {insuranceData.document_file.name}
            </Typography>
          )}

          {insuranceSuccess && (
            <Typography color="success.main" variant="body2">
              {insuranceSuccess}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsuranceDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInsuranceSubmit}
            variant="contained"
            disabled={
              !insuranceData.provider_name ||
              !insuranceData.insurance_number ||
              !insuranceData.activation_date
            }
          >
            Save Insurance Information
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RiderListingPage;
