import React from 'react';
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
    Paper
} from '@mui/material';

const dummyCompanies = [
    { id: 1, name: 'TechNova Pvt Ltd', location: 'Bangalore', industry: 'IT Services' },
    { id: 2, name: 'GreenCore Solutions', location: 'Hyderabad', industry: 'Renewable Energy' },
    { id: 3, name: 'Buildify Constructions', location: 'Mumbai', industry: 'Infrastructure' },
    { id: 4, name: 'EduSpark', location: 'Delhi', industry: 'EdTech' }
];

const CompanyListPage = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, minWidth: '77vw' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Company Listings</Typography>
                <Button variant="contained" color="primary">Add Company</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Industry</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dummyCompanies.map(company => (
                            <TableRow key={company.id}>
                                <TableCell>{company.id}</TableCell>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.location}</TableCell>
                                <TableCell>{company.industry}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default CompanyListPage;
