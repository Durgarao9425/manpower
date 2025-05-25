import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';

const colorOptions = [
  { value: 'blue', color: '#3B82F6', name: 'Blue' },
  { value: 'green', color: '#10B981', name: 'Green' },
  { value: 'purple', color: '#8B5CF6', name: 'Purple' },
  { value: 'red', color: '#EF4444', name: 'Red' },
  { value: 'orange', color: '#F97316', name: 'Orange' },
  { value: 'pink', color: '#EC4899', name: 'Pink' },
];

// Font options
const fontOptions = [
  { value: 'Roboto', name: 'Roboto' },
  { value: '"Open Sans", sans-serif', name: 'Open Sans' },
  { value: 'Lato, sans-serif', name: 'Lato' },
  { value: 'Montserrat, sans-serif', name: 'Montserrat' },
  { value: '"Poppins", sans-serif', name: 'Poppins' },
];

const ThemeSettings = () => {
  const [settings, setSettings] = useState({
    allowPersonalization: true,
    navigationMenu: 'sidebar',
    navigationBackground: 'charcoal-black',
    preferredColor: 'green',
    fontType: 'Roboto'
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    // Here you would typically make an API call
  };

  return (
    <Box sx={{ display: 'flex',minHeight:'100vh',minWidth:'60vw'}}>      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            Theme Settings
          </Typography>

          <Paper sx={{ p: 4 }}>
            {/* Allow personalization */}
            <FormControlLabel
              control={
                <Checkbox 
                  checked={settings.allowPersonalization}
                  onChange={(e) => handleChange('allowPersonalization', e.target.checked)}
                />
              }
              label="Allow other users to personalize their theme and font?"
              sx={{ mb: 4 }}
            />

            {/* Navigation Menu */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Navigation Menu</Typography>
              <ToggleButtonGroup
                value={settings.navigationMenu}
                exclusive
                onChange={(e, value) => value && handleChange('navigationMenu', value)}
                aria-label="navigation menu"
              >
                <ToggleButton value="topbar">Topbar</ToggleButton>
                <ToggleButton value="sidebar" sx={{ bgcolor: settings.navigationMenu === 'sidebar' ? '#FFEB3B' : 'inherit' }}>Sidebar</ToggleButton>
                <ToggleButton value="sidebar-lite">Sidebar lite</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Navigation Background */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Navigation Background</Typography>
              <ToggleButtonGroup
                value={settings.navigationBackground}
                exclusive
                onChange={(e, value) => value && handleChange('navigationBackground', value)}
                aria-label="navigation background"
              >
                <ToggleButton value="charcoal-black" sx={{ 
                  bgcolor: settings.navigationBackground === 'charcoal-black' ? 'rgba(100,200,255,0.2)' : 'inherit'
                }}>
                  Charcoal black
                </ToggleButton>
                <ToggleButton value="polar-white">Polar white</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Preferred Color */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Preferred Color</Typography>
              <Stack direction="row" spacing={1}>
                {colorOptions.map((option) => (
                  <Box
                    key={option.value}
                    onClick={() => handleChange('preferredColor', option.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: option.color,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: settings.preferredColor === option.value ? '2px solid #000' : 'none'
                    }}
                  >
                    {settings.preferredColor === option.value && (
                      <Box sx={{ color: 'white', fontWeight: 'bold' }}>✓</Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Font Type */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Font Type</Typography>
              <FormControl sx={{ width: 300 }}>
                <InputLabel id="font-type-label">Font</InputLabel>
                <Select
                  labelId="font-type-label"
                  value={settings.fontType}
                  label="Font"
                  onChange={(e) => handleChange('fontType', e.target.value)}
                >
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Open Sans">Open Sans</MenuItem>
                  <MenuItem value="Lato">Lato</MenuItem>
                  <MenuItem value="Montserrat">Montserrat</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Save Button */}
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#3B82F6',
                '&:hover': { bgcolor: '#2563EB' } 
              }}
              onClick={handleSave}
            >
              Save
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ThemeSettings;