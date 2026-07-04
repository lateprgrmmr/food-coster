import {
    Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Chip, CircularProgress, Box,
    Button,
} from '@mui/material';
import { useGetInvoicesQuery } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';


export const Invoices = () => {
    const { data: invoices, isLoading, isError } = useGetInvoicesQuery();
    const navigate = useNavigate();
    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (isError) {
        return <Typography color="error">Failed to load invoices.</Typography>;
    }

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
                Back to Home
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Invoices</Typography>
                <Button variant="contained" onClick={() => navigate('/invoices/new')}>New Invoice</Button>
            </Box>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Vendor</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Items</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No invoices yet.</TableCell>
                            </TableRow>
                        )}
                        {invoices?.map((inv) => (
                            <TableRow key={inv.id} hover onClick={() => navigate(`/invoices/${inv.id}`)}>
                                <TableCell>{inv.invoiceNumber ?? '—'}</TableCell>
                                <TableCell>{inv.vendorName}</TableCell>
                                <TableCell>{inv.locationName}</TableCell>
                                <TableCell>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '—'}</TableCell>
                                <TableCell align="right">{inv.itemCount}</TableCell>
                                <TableCell align="right">
                                    {Number(inv.total).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                                </TableCell>
                                <TableCell><Chip label={inv.status} size="small" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};
