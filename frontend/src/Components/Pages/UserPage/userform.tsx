import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  Box,
  FormHelperText,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface User {
  company_id?: number | string;
  username?: string;
  password?: string;
  email?: string;
  user_type?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  profile_image?: string;
  status?: "active" | "inactive" | "suspended";
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user?: User;
}

interface UserFormData {
  company_id: number | string;
  username: string;
  password: string;
  email: string;
  user_type: string;
  full_name: string;
  phone: string;
  address: string;
  profile_image: string;
  status: "active" | "inactive" | "suspended";
  created_by?: number;
  company_name?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, onSave, user }) => {
  const [formData, setFormData] = useState<UserFormData>({
    company_id: "",
    username: "",
    password: "",
    email: "",
    user_type: "",
    full_name: "",
    phone: "",
    address: "",
    profile_image: "",
    status: "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        company_id: user.company_id ?? "",
        username: user.username ?? "",
        password: "", // Password is never prefilled for security reasons
        email: user.email ?? "",
        user_type: user.user_type ?? "",
        full_name: user.full_name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        profile_image: user.profile_image ?? "",
        status: user.status ?? "active",
      });
      setIsEditMode(true);
    } else {
      setFormData({
        company_id: "",
        username: "",
        password: "",
        email: "",
        user_type: "",
        full_name: "",
        phone: "",
        address: "",
        profile_image: "",
        status: "active",
      });
      setIsEditMode(false);
    }
    // Clear errors when user changes
    setErrors({});
  }, [user]);

  const validateField = (
    name: keyof UserFormData,
    value: string | number
  ): string => {
    switch (name) {
      case "username":
        return !value || String(value).trim() === ""
          ? "Username is required"
          : "";
      case "password":
        return !isEditMode && (!value || String(value).trim() === "")
          ? "Password is required"
          : "";
      case "email":
        if (!value || String(value).trim() === "") {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(String(value))
          ? "Please enter a valid email address"
          : "";
      case "user_type":
        return !value || String(value).trim() === ""
          ? "User Type is required"
          : "";
      case "full_name":
        return !value || String(value).trim() === ""
          ? "Full Name is required"
          : "";
      default:
        return "";
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Required fields
    const requiredFields: (keyof UserFormData)[] = [
      "username",
      "email",
      "user_type",
      "full_name",
    ];

    // Add password to required fields only in create mode
    if (!isEditMode) {
      requiredFields.push("password");
    }

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof UserFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof UserFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user makes selection
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  const handleSubmit = () => {
    if (validateAllFields()) {
      // Add backend-required fields for minimal inserts
      let dataToSend = { ...formData };
      if (formData.user_type === 'rider') {
        dataToSend.created_by = 1; // Or get from context/session if available
        dataToSend.status = formData.status || 'Active';
      }
      if (formData.user_type === 'company') {
        dataToSend.created_by = 1; // Or get from context/session if available
        dataToSend.company_name = formData.full_name; // Use full_name as company_name if not present
      }
      onSave(dataToSend);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? "Edit User" : "Add New User"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Left Section: Avatar + Upload */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  backgroundColor: "#fafafa",
                }}
              >
                <Avatar
                  src={formData.profile_image}
                  sx={{ width: 100, height: 100, fontSize: 36 }}
                >
                  {formData.full_name?.charAt(0) || "U"}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  size="small"
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
            </Grid>

            {/* Right Section: Form */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    error={!!errors.username}
                    helperText={errors.username}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>

                {!isEditMode && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      error={!!errors.password}
                      helperText={errors.password}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.user_type}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleSelectChange}
                      label="User Type"
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="rider">Rider</MenuItem>
                      <MenuItem value="store_manager">Store Manager</MenuItem>
                    </Select>
                    {errors.user_type && (
                      <FormHelperText>{errors.user_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company ID"
                    name="company_id"
                    type="number"
                    value={formData.company_id}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleSelectChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
