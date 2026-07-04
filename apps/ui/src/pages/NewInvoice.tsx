import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import {
      Box, TextField, Button, Typography, Alert, Paper, Stack, MenuItem,
      Table, TableHead, TableRow, TableCell, TableBody, IconButton, CircularProgress,
  } from '@mui/material';
  import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
  import { useGetVendorsQuery, useGetLocationsQuery, useCreateInvoiceMutation } from '../lib/api';
  
  type LineItem = { description: string; quantity: number; unitPrice: string };
  const emptyItem: LineItem = { description: '', quantity: 0, unitPrice: '' };
  const currency = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  
  export const NewInvoice = () => {
      const navigate = useNavigate();
      const { data: vendors, isLoading: vendorsLoading } = useGetVendorsQuery();
      const { data: locations, isLoading: locationsLoading } = useGetLocationsQuery();
      const [createInvoice, { isLoading: isSaving }] = useCreateInvoiceMutation();
  
      const [vendorId, setVendorId] = useState('');
      const [locationId, setLocationId] = useState('');
      const [invoiceNumber, setInvoiceNumber] = useState('');
      const [invoiceDate, setInvoiceDate] = useState('');
      const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
      const [error, setError] = useState('');
  
      if (vendorsLoading || locationsLoading) {
          return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
      }
  
      const updateItem = (index: number, field: keyof LineItem, value: string) =>
          setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
      const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
      const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  
      const lineTotal = (it: LineItem) => (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
      const grandTotal = items.reduce((sum, it) => sum + lineTotal(it), 0);
  
      const handleSave = async () => {
          setError('');
          if (!vendorId || !locationId) {
              setError('Vendor and location are required');
              return;
          }
          const validItems = items.filter((it) => it.description || it.quantity || it.unitPrice);
          if (validItems.length === 0) {
              setError('Add at least one line item');
              return;
          }
          try {
              const created = await createInvoice({
                  vendorId, locationId, invoiceNumber, invoiceDate, items: validItems,
              }).unwrap();
              navigate(`/invoices/${created.id}`);
          } catch {
              setError('Failed to save invoice');
          }
      };
  
      return (
          <Box sx={{ maxWidth: 800 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')} sx={{ mb: 2 }}>
                  Back to invoices
              </Button>
              <Typography variant="h5" sx={{ mb: 2 }}>New Invoice</Typography>
              <Paper sx={{ p: 3 }}>
                  <Stack spacing={2}>
                      {error && <Alert severity="error">{error}</Alert>}
                      <Stack direction="row" spacing={2}>
                          <TextField select label="Vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)} fullWidth required>
                              {vendors?.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                          </TextField>
                          <TextField select label="Location" value={locationId} onChange={(e) => setLocationId(e.target.value)} fullWidth required>
                              {locations?.map((l) => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                          </TextField>
                      </Stack>
                      <Stack direction="row" spacing={2}>
                          <TextField label="Invoice #" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} fullWidth />
                          <TextField label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} fullWidth />
                      </Stack>
  
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Line Items</Typography>
                      <Table size="small">
                          <TableHead>
                              <TableRow>
                                  <TableCell>Description</TableCell>
                                  <TableCell align="right">Qty</TableCell>
                                  <TableCell align="right">Unit Price</TableCell>
                                  <TableCell align="right">Total</TableCell>
                                  <TableCell />
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {items.map((it, i) => (
                                  <TableRow key={i}>
                                      <TableCell>
                                          <TextField value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} fullWidth variant="standard" />
                                      </TableCell>
                                      <TableCell align="right" sx={{ width: 90 }}>
                                          <TextField value={it.quantity} onChange={(e) => updateItem(i, 'quantity', String(Number(e.target.value)))} type="number" variant="standard" />
                                      </TableCell>
                                      <TableCell align="right" sx={{ width: 110 }}>
                                          <TextField value={it.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} type="number" variant="standard" />
                                      </TableCell>
                                      <TableCell align="right">{currency(lineTotal(it))}</TableCell>
                                      <TableCell>
                                          <IconButton size="small" onClick={() => removeItem(i)} disabled={items.length === 1}>
                                              <DeleteIcon fontSize="small" />
                                          </IconButton>
                                      </TableCell>
                                  </TableRow>
                              ))}
                              <TableRow>
                                  <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                                  <TableCell align="right"><strong>{currency(grandTotal)}</strong></TableCell>
                                  <TableCell />
                              </TableRow>
                          </TableBody>
                      </Table>
                      <Box><Button startIcon={<AddIcon />} onClick={addItem}>Add line item</Button></Box>
  
                      <Box>
                          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
                              {isSaving ? 'Saving...' : 'Save Invoice'}
                          </Button>
                      </Box>
                  </Stack>
              </Paper>
          </Box>
      );
  };
