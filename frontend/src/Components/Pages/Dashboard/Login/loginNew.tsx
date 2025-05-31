// import React, { useState, type JSX } from "react";
// import {
//   Box,
//   Container,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   IconButton,
//   InputAdornment,
//   Alert,
//   Link,
//   useTheme,
//   useMediaQuery,
//   Divider,
//   Avatar,
// } from "@mui/material";
// import {
//   Visibility,
//   VisibilityOff,
//   Google,
//   GitHub,
//   Person,
//   TwoWheeler,
// } from "@mui/icons-material";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// // Custom theme
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#2DD4BF", // Teal color from the image
//     },
//     secondary: {
//       main: "#1F2937", // Dark gray
//     },
//     background: {
//       default: "#F9FAFB",
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
//     h4: {
//       fontWeight: 700,
//       color: "#111827",
//     },
//     body1: {
//       color: "#6B7280",
//     },
//     body2: {
//       color: "#9CA3AF",
//     },
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: "none",
//           borderRadius: 8,
//           padding: "12px 24px",
//           fontSize: "16px",
//           fontWeight: 600,
//           boxShadow: "none",
//           "&:hover": {
//             boxShadow: "none",
//           },
//         },
//         contained: {
//           backgroundColor: "#1F2937",
//           color: "white",
//           "&:hover": {
//             backgroundColor: "#374151",
//           },
//         },
//         outlined: {
//           borderColor: "#D1D5DB",
//           color: "#374151",
//           "&:hover": {
//             borderColor: "#9CA3AF",
//             backgroundColor: "#F9FAFB",
//           },
//         },
//       },
//     },
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           "& .MuiOutlinedInput-root": {
//             borderRadius: 8,
//             backgroundColor: "white",
//             "& fieldset": {
//               borderColor: "#D1D5DB",
//             },
//             "&:hover fieldset": {
//               borderColor: "#9CA3AF",
//             },
//             "&.Mui-focused fieldset": {
//               borderColor: "#2DD4BF",
//               borderWidth: 2,
//             },
//           },
//           "& .MuiInputLabel-root": {
//             color: "#6B7280",
//           },
//           "& .MuiFormHelperText-root": {
//             color: "#EF4444",
//           },
//         },
//       },
//     },
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//           boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
//         },
//       },
//     },
//   },
// });

// // Types
// interface FormData {
//   username: string;
//   password: string;
// }

// interface Errors {
//   username?: string;
//   password?: string;
// }

// interface LoginResponse {
//   user: {
//     id: number;
//     full_name: string;
//     email: string;
//     user_type: string;
//   };
//   message?: string;
// }

// // Illustration Component for Web View
// const IllustrationSection: React.FC = () => (
//   <Box
//     sx={{
//       flex: 1,
//       display: { xs: "none", md: "flex" },
//       flexDirection: "row", // Changed from column to row
//       justifyContent: "space-between", // To space out the illustration and content
//       alignItems: "center",
//       backgroundColor: "#F0FDFA",
//       p: 4,
//       position: "relative",
//       overflow: "hidden",
//     }}
//   >
//     {/* Delivery Rider Illustration on the left */}
//     <Box
//       sx={{
//         flex: 1,
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 4,
//       }}
//     >
//       <img
//         src="https://cdn-icons-png.flaticon.com/512/2452/2452496.png" 
//         alt="Delivery Rider"
//         style={{
//           width: "80%",
//           maxWidth: "400px",
//           height: "auto",
//         }}
//       />
//     </Box>

//     {/* Logo - moved inside the content box for better positioning */}
    
//     {/* Main Content - now takes less width */}
//     <Box sx={{
//       flex: 1,
//       textAlign: "center",
//       maxWidth: 400,
//       position: "relative",
//     }}>
//       {/* Logo */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: -32,
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           alignItems: "center",
//           gap: 1,
//         }}
//       >
//         <Box
//           sx={{
//             width: 32,
//             height: 32,
//             backgroundColor: "#2DD4BF",
//             borderRadius: "50%",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
//             M
//           </Typography>
//         </Box>
//         <Typography variant="h6" sx={{ color: "#111827", fontWeight: 600 }}>
//           ManPower
//         </Typography>
//       </Box>

//       <Typography
//         variant="h4"
//         sx={{
//           mb: 2,
//           fontSize: { xs: "24px", md: "32px" },
//           fontWeight: 700,
//           color: "#111827",
//         }}
//       >
//         Hi, Welcome back
//       </Typography>
//       <Typography
//         variant="body1"
//         sx={{
//           color: "#6B7280",
//           fontSize: "16px",
//           lineHeight: 1.6,
//         }}
//       >
//         More effectively with optimized workflows.
//       </Typography>

//       {/* Illustration Graphics */}
//       <Box
//         sx={{
//           mt: 4,
//           display: "flex",
//           justifyContent: "center",
//           gap: 2,
//           flexWrap: "wrap",
//         }}
//       >
//         {/* Dashboard Cards */}
//         <Box
//           sx={{
//             width: 120,
//             height: 80,
//             backgroundColor: "white",
//             borderRadius: 2,
//             p: 1,
//             boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//             display: "flex",
//             flexDirection: "column",
//             gap: 1,
//           }}
//         >
//           <Box sx={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 1 }} />
//           <Box sx={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 1, width: "70%" }} />
//           <Box
//             sx={{
//               height: 20,
//               backgroundColor: "#2DD4BF",
//               borderRadius: 1,
//               width: "100%",
//             }}
//           />
//         </Box>

//         <Box
//           sx={{
//             width: 80,
//             height: 80,
//             backgroundColor: "white",
//             borderRadius: 2,
//             p: 1,
//             boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Box
//             sx={{
//               width: 40,
//               height: 40,
//               backgroundColor: "#FEF3C7",
//               borderRadius: "50%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               sx={{
//                 width: 20,
//                 height: 20,
//                 backgroundColor: "#F59E0B",
//                 borderRadius: "50%",
//               }}
//             />
//           </Box>
//         </Box>
//       </Box>

//       {/* Bottom Icons */}
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: 32,
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           gap: 2,
//         }}
//       >
//         {[...Array(5)].map((_, i) => (
//           <Box
//             key={i}
//             sx={{
//               width: 32,
//               height: 32,
//               backgroundColor: i === 0 ? "#2DD4BF" : "#E5E7EB",
//               borderRadius: i === 1 ? 1 : "50%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           />
//         ))}
//       </Box>
//     </Box>
//   </Box>
// );

// export default function LoginPageNew(): JSX.Element {
//   const [formData, setFormData] = useState<FormData>({
//     username: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [errors, setErrors] = useState<Errors>({});
//   const [loginError, setLoginError] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     if (errors[name as keyof Errors]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//     if (loginError) setLoginError("");
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Errors = {};

//     if (!formData.username.trim()) {
//       newErrors.username = "Username is required";
//     }

//     if (!formData.password.trim()) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();
//     setLoginError("");

//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     try {
//       const response = await fetch("http://localhost:4003/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: formData.username,
//           password: formData.password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setLoginError(data.message || "Invalid username or password");
//         return;
//       }

//       if (data.user) {
//         // Store user data in localStorage
//         localStorage.setItem("isAuthenticated", "true");
//         localStorage.setItem("userRole", data.user.user_type);
//         localStorage.setItem("userId", data.user.id.toString());
//         localStorage.setItem("userName", data.user.full_name);
//         localStorage.setItem("userEmail", data.user.email);

//         // Navigate based on user type
//         if (data.user.user_type === "admin") {
//           navigate("/dashboard");
//         } else if (data.user.user_type === "rider") {
//           navigate("/rider-dashboard");
//         } else {
//           setLoginError("Access denied. Invalid user type.");
//         }
//       } else {
//         setLoginError("Invalid response from server");
//       }
//     } catch (error: any) {
//       console.error("Login error:", error);
//       setLoginError("Unable to connect to server. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleTogglePasswordVisibility = (): void => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleCreateAccount = (): void => {
//     navigate("/rider-form");
//   };

//   const handleSocialLogin = (provider: string): void => {
//     console.log(`Login with ${provider}`);
//     // Implement social login logic
//   };

//   // Mobile View
//   if (isMobile) {
//     return (
//       <ThemeProvider theme={theme}>
//         <Box
//           sx={{
//             minHeight: "100vh",
//             background: "linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 25%, #81E6D9 50%, #4FD1C7 75%, #26D0CE 100%)",
//             display: "flex",
//             flexDirection: "column",
//             width: "100%",
//             position: "relative",
//           }}
//         >
//           {/* Mobile Form */}
//           <Container
//             maxWidth="sm"
//             sx={{
//               flex: 1,
//               px: 3,
//               py: 2,
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//               minWidth: '100vw'
//             }}
//           >
//             {/* App Icon and Title */}
//             <Box sx={{ textAlign: 'center', mb: 4 }}>
//               <Box
//                 sx={{
//                   display: 'inline-flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   width: 80,
//                   height: 80,
//                   borderRadius: '50%',
//                   background: 'linear-gradient(45deg, #14B8A6, #06B6D4)',
//                   mb: 2,
//                   boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)'
//                 }}
//               >
//                 <TwoWheeler sx={{ fontSize: 40, color: 'white' }} />
//               </Box>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: 600,
//                   color: "#065F46",
//                   mb: 1,
//                   letterSpacing: '0.5px'
//                 }}
//               >
//                 Delivery Rider Management
//               </Typography>
//             </Box>

//             <Box sx={{ mb: 4 }}>
//               <Typography
//                 variant="h5"
//                 sx={{ fontWeight: 700, color: "#065F46", mb: 1 }}
//               >
//                 Welcome Back
//               </Typography>
//               <Typography variant="body2" sx={{ color: "#047857" }}>
//                 Sign in to continue to your dashboard
//               </Typography>
//             </Box>

//             {loginError && (
//               <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
//                 {loginError}
//               </Alert>
//             )}

//             <Box component="form" onSubmit={handleSubmit}>
//               <TextField
//                 fullWidth
//                 label="User Name"
//                 name="username"
//                 type="text"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 error={!!errors.username}
//                 helperText={errors.username}
//                 sx={{
//                   mb: 3,
//                   '& .MuiOutlinedInput-root': {
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     borderRadius: 2,
//                   }
//                 }}
//               />

//               <Box sx={{ mb: 3 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     mb: 1,
//                   }}
//                 >
//                   <Typography variant="body2" sx={{ color: "#065F46", fontWeight: 500 }}>
//                     Password
//                   </Typography>
//                   <Link
//                     component="button"
//                     type="button"
//                     onClick={() => { }}
//                     sx={{
//                       color: "#14B8A6",
//                       textDecoration: "none",
//                       fontSize: "14px",
//                       fontWeight: 500,
//                     }}
//                   >
//                     Forgot password?
//                   </Link>
//                 </Box>
//                 <TextField
//                   fullWidth
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   error={!!errors.password}
//                   helperText={errors.password}
//                   placeholder="6+ characters"
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                       borderRadius: 2,
//                     }
//                   }}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           onClick={handleTogglePasswordVisibility}
//                           edge="end"
//                           size="small"
//                         >
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Box>

//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 disabled={isSubmitting}
//                 sx={{
//                   mb: 3,
//                   py: 1.5,
//                   background: 'linear-gradient(45deg, #14B8A6, #06B6D4)',
//                   borderRadius: 2,
//                   boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
//                   '&:hover': {
//                     background: 'linear-gradient(45deg, #0F766E, #0284C7)',
//                     boxShadow: '0 6px 25px rgba(20, 184, 166, 0.4)',
//                   },
//                   '&:disabled': {
//                     background: 'rgba(20, 184, 166, 0.5)',
//                     color: 'white',
//                   }
//                 }}
//               >
//                 {isSubmitting ? "Signing in..." : "Sign in"}
//               </Button>
//             </Box>
//           </Container>
//         </Box>
//       </ThemeProvider>
//     );
//   }

//   // Desktop View
//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           minHeight: "100vh",
//           display: "flex",
//           backgroundColor: "#F9FAFB",
//           minWidth: "100vw"
//         }}
//       >
//         {/* Left Side - Illustration */}
//         <IllustrationSection />

//         {/* Right Side - Login Form */}
//         <Box
//           sx={{
//             flex: 1,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             p: 4,
//             maxWidth: { md: "50%", lg: "40%" },
//           }}
//         >
//           <Box sx={{ width: "100%", maxWidth: 400 }}>
//             {/* Header */}
//             <Box sx={{ mb: 4 }}>
//               <Typography
//                 variant="h4"
//                 sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
//               >
//                 Sign in to your account
//               </Typography>
//               <Typography variant="body1" sx={{ color: "#6B7280" }}>
//                 Don't have an account?{" "}
//                 <Link
//                   component="button"
//                   type="button"
//                   onClick={handleCreateAccount}
//                   sx={{ color: "#2DD4BF", textDecoration: "none", fontWeight: 600 }}
//                 >
//                   Get started
//                 </Link>
//               </Typography>
//             </Box>

//             {loginError && (
//               <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
//                 {loginError}
//               </Alert>
//             )}

//             {/* Form */}
//             <Box component="form" onSubmit={handleSubmit}>
//               <TextField
//                 fullWidth
//                 label="Username"
//                 name="username"
//                 type="text"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 error={!!errors.username}
//                 helperText={errors.username}
//                 sx={{ mb: 3 }}
//               />

//               <Box sx={{ mb: 3 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     mb: 1,
//                   }}
//                 >
//                   <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
//                     Password
//                   </Typography>
//                   <Link
//                     component="button"
//                     type="button"
//                     onClick={() => { }}
//                     sx={{
//                       color: "#2DD4BF",
//                       textDecoration: "none",
//                       fontSize: "14px",
//                       fontWeight: 500,
//                     }}
//                   >
//                     Forgot password?
//                   </Link>
//                 </Box>
//                 <TextField
//                   fullWidth
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   error={!!errors.password}
//                   helperText={errors.password}
//                   placeholder="6+ characters"
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           onClick={handleTogglePasswordVisibility}
//                           edge="end"
//                           size="small"
//                         >
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Box>

//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 disabled={isSubmitting}
//                 sx={{ mb: 4, py: 1.5 }}
//               >
//                 {isSubmitting ? "Signing in..." : "Sign in"}
//               </Button>

//               <Box sx={{ textAlign: "center", mb: 4 }}>
//                 <Typography variant="body2" sx={{ color: "#9CA3AF", mb: 3 }}>
//                   OR
//                 </Typography>
//                 <Box sx={{ display: "flex", gap: 2 }}>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     startIcon={<Google />}
//                     onClick={() => handleSocialLogin("google")}
//                     sx={{ py: 1.5 }}
//                   >
//                     Google
//                   </Button>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     startIcon={<GitHub />}
//                     onClick={() => handleSocialLogin("github")}
//                     sx={{ py: 1.5 }}
//                   >
//                     GitHub
//                   </Button>
//                   <Button
//                     fullWidth
//                     variant="outlined"
//                     onClick={() => handleSocialLogin("twitter")}
//                     sx={{ py: 1.5 }}
//                   >
//                     X
//                   </Button>
//                 </Box>
//               </Box>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }


import React, { useState, useEffect, type JSX } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
  Person,
  TwoWheeler,
  ArrowBack,
  Login as LoginIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authcontext";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2DD4BF", // Teal color from the image
    },
    secondary: {
      main: "#1F2937", // Dark gray
    },
    background: {
      default: "#F9FAFB",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#111827",
    },
    body1: {
      color: "#6B7280",
    },
    body2: {
      color: "#9CA3AF",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#1F2937",
          color: "white",
          "&:hover": {
            backgroundColor: "#374151",
          },
        },
        outlined: {
          borderColor: "#D1D5DB",
          color: "#374151",
          "&:hover": {
            borderColor: "#9CA3AF",
            backgroundColor: "#F9FAFB",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "white",
            "& fieldset": {
              borderColor: "#D1D5DB",
            },
            "&:hover fieldset": {
              borderColor: "#9CA3AF",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2DD4BF",
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root": {
            color: "#6B7280",
          },
          "& .MuiFormHelperText-root": {
            color: "#EF4444",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      },
    },
  },
});

// Types
interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface Errors {
  username?: string;
  password?: string;
}

// Illustration Component for Web View
const IllustrationSection: React.FC = () => (
  <Box
    sx={{
      flex: 1,
      display: { xs: "none", md: "flex" },
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#F0FDFA",
      p: 4,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Delivery Rider Illustration on the left */}
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/2452/2452496.png" 
        alt="Delivery Rider"
        style={{
          width: "80%",
          maxWidth: "400px",
          height: "auto",
        }}
      />
    </Box>

    {/* Main Content */}
    <Box sx={{
      flex: 1,
      textAlign: "center",
      maxWidth: 400,
      position: "relative",
    }}>
      {/* Logo */}
      <Box
        sx={{
          position: "absolute",
          top: -32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "#2DD4BF",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
            M
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: "#111827", fontWeight: 600 }}>
          ManPower
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontSize: { xs: "24px", md: "32px" },
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Hi, Welcome back
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#6B7280",
          fontSize: "16px",
          lineHeight: 1.6,
        }}
      >
        More effectively with optimized workflows.
      </Typography>

      {/* Illustration Graphics */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Dashboard Cards */}
        <Box
          sx={{
            width: 120,
            height: 80,
            backgroundColor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box sx={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 1 }} />
          <Box sx={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 1, width: "70%" }} />
          <Box
            sx={{
              height: 20,
              backgroundColor: "#2DD4BF",
              borderRadius: 1,
              width: "100%",
            }}
          />
        </Box>

        <Box
          sx={{
            width: 80,
            height: 80,
            backgroundColor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#FEF3C7",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: "#F59E0B",
                borderRadius: "50%",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Bottom Icons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 2,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: i === 0 ? "#2DD4BF" : "#E5E7EB",
              borderRadius: i === 1 ? 1 : "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        ))}
      </Box>
    </Box>
  </Box>
);

export default function EnhancedLoginPage(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loginError, setLoginError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Import useAuth hook from the first component
  const { login } = useAuth();

  // Load remembered username on component mount
  useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setFormData(prev => ({
        ...prev,
        username: rememberedUser,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear any previous login errors
    if (loginError) setLoginError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting login form with username:", formData.username);

    try {
      // Use the auth service to login (from first component)
      console.log("Calling login function from auth context");
      await login(formData.username, formData.password);
      console.log("Login successful");
      
      // Remember username if selected
      if (formData.rememberMe) {
        localStorage.setItem("rememberedUser", formData.username);
        console.log("Remembered username saved");
      } else {
        localStorage.removeItem("rememberedUser");
        console.log("Remembered username removed");
      }
      
      // Note: Navigation is handled in the auth context after successful login
    } catch (error) {
      console.error("Login form error:", error);
      setLoginError(error instanceof Error ? error.message : "Unable to connect to server. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleCreateAccount = (): void => {
    navigate("/rider-form");
  };

  const handleSocialLogin = (provider: string): void => {
    console.log(`Login with ${provider}`);
    // Implement social login logic
  };

  // Mobile View
  if (isMobile) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 25%, #81E6D9 50%, #4FD1C7 75%, #26D0CE 100%)",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Back Button */}
          <IconButton
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
            onClick={() => navigate("/")}
          >
            <ArrowBack />
          </IconButton>

          {/* Mobile Form */}
          <Container
            maxWidth="sm"
            sx={{
              flex: 1,
              px: 3,
              py: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: '100vw'
            }}
          >
            {/* App Icon and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #14B8A6, #06B6D4)',
                  mb: 2,
                  boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)'
                }}
              >
                <TwoWheeler sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#065F46",
                  mb: 1,
                  letterSpacing: '0.5px'
                }}
              >
                ManPower Project Delivery
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#065F46", mb: 1 }}
              >
                Welcome Back!
              </Typography>
              <Typography variant="body2" sx={{ color: "#047857" }}>
                Sign in to ManPower Project Delivery
              </Typography>
            </Box>

            {loginError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {loginError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#065F46", fontWeight: 500 }}>
                    Password
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => { }}
                    sx={{
                      color: "#14B8A6",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  placeholder="6+ characters"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 2,
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    sx={{ color: "#14B8A6" }}
                  />
                }
                label="Remember me"
                sx={{ mb: 2, '& .MuiFormControlLabel-label': { color: "#065F46" } }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                disabled={isSubmitting}
                sx={{
                  mb: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #14B8A6, #06B6D4)',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(20, 184, 166, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0F766E, #0284C7)',
                    boxShadow: '0 6px 25px rgba(20, 184, 166, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(20, 184, 166, 0.5)',
                    color: 'white',
                  }
                }}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="text"
                    size="small"
                    onClick={handleCreateAccount}
                    sx={{ color: "#14B8A6" }}
                  >
                    Create Account
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="caption" sx={{ color: "#047857" }}>
                © 2024 ManPower Project Delivery
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // Desktop View
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          backgroundColor: "#F9FAFB",
          minWidth: "100vw"
        }}
      >
        {/* Back Button */}
        <IconButton
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            color: "#374151",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
          }}
          onClick={() => navigate("/")}
        >
          <ArrowBack />
        </IconButton>

        {/* Left Side - Illustration */}
        <IllustrationSection />

        {/* Right Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            maxWidth: { md: "50%", lg: "40%" },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
              >
                Welcome Back!
              </Typography>
              <Typography variant="body1" sx={{ color: "#6B7280" }}>
                Don't have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={handleCreateAccount}
                  sx={{ color: "#2DD4BF", textDecoration: "none", fontWeight: 600 }}
                >
                  Get started
                </Link>
              </Typography>
            </Box>

            {loginError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {loginError}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
                    Password
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => { }}
                    sx={{
                      color: "#2DD4BF",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  placeholder="6+ characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                disabled={isSubmitting}
                sx={{ mb: 4, py: 1.5 }}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography variant="body2" sx={{ color: "#9CA3AF", mb: 3 }}>
                  OR
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    onClick={() => handleSocialLogin("google")}
                    sx={{ py: 1.5 }}
                  >
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={() => handleSocialLogin("github")}
                    sx={{ py: 1.5 }}
                  >
                    GitHub
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleSocialLogin("twitter")}
                    sx={{ py: 1.5 }}
                  >
                    X
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                © 2024 ManPower Project Delivery
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}