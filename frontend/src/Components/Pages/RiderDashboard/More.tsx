import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';
import {
    Notifications as NotificationsIcon,
    Help as HelpIcon,
    Info as InfoIcon,
    Feedback as FeedbackIcon,
    Language as LanguageIcon,
    Security as SecurityIcon
} from '@mui/icons-material';

interface MoreProps {
    onNavigate: (pageIndex: number) => void;
}

const More: React.FC<MoreProps> = ({ onNavigate }) => {
    const { themeColor } = useTheme();

    const menuItems = [
        { icon: <NotificationsIcon />, text: 'Notifications', onClick: () => {} },
        { icon: <HelpIcon />, text: 'Help & Support', onClick: () => {} },
        { icon: <InfoIcon />, text: 'About', onClick: () => {} },
        { icon: <FeedbackIcon />, text: 'Send Feedback', onClick: () => {} },
        { icon: <LanguageIcon />, text: 'Language', onClick: () => {} },
        { icon: <SecurityIcon />, text: 'Privacy & Security', onClick: () => {} }
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                More Options
            </Typography>
            <List>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.text}>
                        <ListItem
                            button
                            onClick={item.onClick}
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                '&:hover': {
                                    backgroundColor: `${themeColor}10`
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: themeColor }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    sx: { color: '#333', fontWeight: 500 }
                                }}
                            />
                        </ListItem>
                        {index < menuItems.length - 1 && (
                            <Divider sx={{ my: 1 }} />
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default More; 