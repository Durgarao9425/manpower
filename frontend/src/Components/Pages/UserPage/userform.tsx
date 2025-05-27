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
  InputAdornment,
  IconButton,
} from "@mui/material";
import { CloudUpload, Visibility, VisibilityOff } from "@mui/icons-material";
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
}

interface FormErrors {
  company_id?: string;
  username?: string;
  password?: string;
  email?: string;
  user_type?: string;
  full_name?: string;
  phone?: string;
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, onSave, user }) => {
  const [formData, setFormData] = useState<UserFormData>({
    company_id: "",
    username: "",
    password: "",
    email: "",
    user_type: "admin",
    full_name: "",
    phone: "",
    address: "",
    profile_image: "",
    status: "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Single unified handle change function
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

    // Clear submit status
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
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

  // Generate username from full_name
  const generateUsername = () => {
    // Use the current state value directly
    setFormData((prev) => {
      const fullName = prev.full_name.trim();
      if (!fullName) return prev;

      const baseName = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
        .substring(0, 8);
      
      const timestamp = Date.now().toString().slice(-4);
      const username = baseName ? `${baseName}_${timestamp}` : `user_${timestamp}`;
      
      return {
        ...prev,
        username: username
      };
    });

    // Clear username error if any
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password: password
    }));

    // Clear password error if any
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        company_id: user.company_id ?? "",
        username: user.username ?? "",
        password: "", // Password is never prefilled for security reasons
        email: user.email ?? "",
        user_type: user.user_type ?? "admin",
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
        user_type: "admin",
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
    setSubmitStatus({ type: '', message: '' });
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

  const handleSubmit = () => {
    if (validateAllFields()) {
      onSave(formData);
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
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                  <FormControl fullWidth required error={!!errors.user_type}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleSelectChange}
                      label="User Type"
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                    </Select>
                    {errors.user_type && (
                      <FormHelperText>{errors.user_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Username Generation Row */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!errors.username}
                      helperText={errors.username}
                      placeholder="Enter username or generate from full name"
                      sx={{ flex: 1 }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={generateUsername}
                      disabled={!formData.full_name.trim()}
                      sx={{
                        bgcolor: '#0891b2',
                        '&:hover': { bgcolor: '#0e7490' },
                        minWidth: 120,
                        whiteSpace: 'nowrap',
                        mt: 0.5,
                        height: 56
                      }}
                    >
                      Generate
                    </Button>
                  </Box>
                </Grid>

                {/* Password Generation Row - Only show in create mode */}
                {!isEditMode && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password}
                        placeholder="Enter password or generate"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        onClick={generatePassword}
                        sx={{
                          bgcolor: '#0891b2',
                          '&:hover': { bgcolor: '#0e7490' },
                          minWidth: 120,
                          whiteSpace: 'nowrap',
                          mt: 0.5,
                          height: 56
                        }}
                      >
                        Generate
                      </Button>
                    </Box>
                  </Grid>
                )}

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