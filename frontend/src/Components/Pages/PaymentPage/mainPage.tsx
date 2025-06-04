import React, { useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  useTheme,
  styled,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  AccountBalance as SettlementIcon,
} from "@mui/icons-material";
import PaymentListingPage from "./paymentPage";
import SettlementListingPage from "../../SettleMentPage/SettleMentPage";
import AdvancedRequestListingPage from "../../AdvancedRequestListingPage/AdvancedRequestListingPage";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// Styled components for better UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: 0,
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTab-root": {
    minHeight: 64,
    fontSize: "1rem",
    fontWeight: 500,
    textTransform: "none",
    padding: theme.spacing(2, 3),
  },
  "& .Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textAlign: "center",
}));

const ContentBox = styled(Box)({
  minHeight: "70vh",
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <ContentBox>{children}</ContentBox>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `payment-tab-${index}`,
    "aria-controls": `payment-tabpanel-${index}`,
  };
}

const PaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabsConfig = [
    {
      label: "Payment Requests",
      icon: <PaymentIcon sx={{ mr: 1 }} />,
      component: <PaymentListingPage />,
    },
    {
      label: "Settlement History",
      icon: <SettlementIcon sx={{ mr: 1 }} />,
      component: <SettlementListingPage />,
    },
    {
      label: "Advance Settlement",
      icon: <AccountBalanceWalletIcon sx={{ mr: 1 }} />,
      component: <AdvancedRequestListingPage />,
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <StyledPaper elevation={0}>
        {/* Header */}
        <HeaderBox sx={{ textAlign: "left", alignItems: "flex-start" }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Payment Management System
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            Manage payment requests and settlement history
          </Typography>
        </HeaderBox>

        {/* Navigation Tabs */}
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
              {...a11yProps(index)}
              sx={{
                "&.Mui-selected": {
                  fontWeight: 600,
                },
              }}
            />
          ))}
        </StyledTabs>

        {/* Tab Content */}
        {tabsConfig.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </StyledPaper>
    </Box>
  );
};

export default PaymentManagement;
