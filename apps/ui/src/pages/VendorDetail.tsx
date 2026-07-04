import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, CircularProgress, Alert, Paper, Stack, Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
    useGetVendorQuery, useCreateVendorMutation, useUpdateVendorMutation, type Vendor,
} from '../lib/api';

export const VendorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const isNew = id === 'new';
    const { data: vendor, isLoading } = useGetVendorQuery(id!, { skip: isNew || !id });

    if (!isNew && isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (!isNew && !vendor) {
        return <Typography color="error">Vendor not found.</Typography>;
    }
    return <VendorForm vendor={isNew ? null : vendor!} />;
};

const VendorForm = ({ vendor }: { vendor: Vendor | null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const flash = (location.state as { flash?: string })?.flash;
    const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
    const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
    const isSaving = isCreating || isUpdating;

    const [name, setName] = useState(vendor?.name ?? '');
    const [description, setDescription] = useState(vendor?.description ?? '');
    const [contactFname, setContactFname] = useState(vendor?.contactFname ?? '');
    const [contactLname, setContactLname] = useState(vendor?.contactLname ?? '');
    const [contactEmail, setContactEmail] = useState(vendor?.contactEmail ?? '');
    const [contactPhone, setContactPhone] = useState(vendor?.contactPhone ?? '');
    const [contactTitle, setContactTitle] = useState(vendor?.contactTitle ?? '');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(flash ? { type: 'success', msg: flash } : null);

    const handleSave = async () => {
        setFeedback(null);
        if (!name) {
            setFeedback({ type: 'error', msg: 'Vendor name is required' });
            return;
        }
        const body = { name, description, contactFname, contactLname, contactEmail, contactPhone, contactTitle };
        try {
            if (vendor) {
                await updateVendor({ id: vendor.id, ...body }).unwrap();
                setFeedback({ type: 'success', msg: 'Vendor saved' });
            } else {
                const created = await createVendor(body).unwrap();
                navigate(`/vendors/${created.id}`, { state: { flash: 'Vendor created' } });
            }
        } catch {
            setFeedback({ type: 'error', msg: 'Failed to save vendor' });
        }
    };

    return (
        <Box sx={{ maxWidth: 520 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/vendors')} sx={{ mb: 2 }}>
                Back to vendors
            </Button>
            <Typography variant="h5" sx={{ mb: 2 }}>{vendor ? vendor.name : 'New Vendor'}</Typography>
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}
                    <TextField label="Vendor Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                    <Divider textAlign="left">
                        <Typography variant="caption" color="text.secondary">Primary Contact</Typography>
                    </Divider>
                    <Stack direction="row" spacing={2}>
                        <TextField label="First Name" value={contactFname} onChange={(e) => setContactFname(e.target.value)} fullWidth />
                        <TextField label="Last Name" value={contactLname} onChange={(e) => setContactLname(e.target.value)} fullWidth />
                    </Stack>
                    <TextField label="Title" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} />
                    <TextField label="Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    <TextField label="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    <Typography variant="caption" color="text.secondary">
                        A contact is saved only when both first and last name are filled in.
                    </Typography>

                    <Box>
                        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

