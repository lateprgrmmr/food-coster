import {
    Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Box, Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetVendorsQuery } from '../lib/api';

export const Vendors = () => {
    const { data: vendors, isLoading, isError } = useGetVendorsQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (isError) {
        return <Typography color="error">Failed to load vendors.</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Vendors</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vendors/new')}>
                    Add Vendor
                </Button>
            </Box>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vendors?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No vendors yet.</TableCell>
                            </TableRow>
                        )}
                        {vendors?.map((v) => (
                            <TableRow key={v.id} hover onClick={() => navigate(`/vendors/${v.id}`)} sx={{ cursor: 'pointer' }}>
                                <TableCell>{v.name}</TableCell>
                                <TableCell>{v.contactFname ? `${v.contactFname} ${v.contactLname}` : '—'}</TableCell>
                                <TableCell>{v.contactEmail ?? '—'}</TableCell>
                                <TableCell>{v.contactPhone ?? '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};