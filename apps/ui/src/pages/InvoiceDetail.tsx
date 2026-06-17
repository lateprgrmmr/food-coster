import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Box, Button, Chip, Stack,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useGetInvoiceQuery } from '../lib/api';

const currency = (v: string) =>
    Number(v).toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export const InvoiceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: invoice, isLoading, isError } = useGetInvoiceQuery(id!, { skip: !id });

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (isError || !invoice) {
        return <Typography color="error">Invoice not found.</Typography>;
    }

    const total = invoice.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')} sx={{ mb: 2 }}>
                Back to invoices
            </Button>

            <Stack
                direction="row"
                sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography variant="h5">{invoice.invoiceNumber ?? 'Invoice'}</Typography>
                <Chip label={invoice.status} />
            </Stack>

            <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Vendor</Typography>
                    <Typography>{invoice.vendorName}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography>{invoice.locationName}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '—'}</Typography>
                </Box>
            </Stack>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoice.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.description ?? '—'}</TableCell>
                                <TableCell>{item.subCategoryName ?? 'Uncategorized'}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">{currency(item.unitPrice)}</TableCell>
                                <TableCell align="right">{currency(item.totalPrice)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={4} align="right"><strong>Total</strong></TableCell>
                            <TableCell align="right"><strong>{currency(String(total))}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};