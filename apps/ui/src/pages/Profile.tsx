import { useState } from 'react';
import {
    Box, TextField, Button, Typography, CircularProgress, Alert, Paper, Stack,
} from '@mui/material';
import { useGetMeQuery, useUpdateProfileMutation } from '../lib/api';

type MeUser = {
    id: string;
    email: string;
    role: string;
    organizationId: string;
    contactId: string;
    fname: string;
    lname: string;
    contactEmail: string | null;
    phone: string | null;
};

export const Profile = () => {
    const { data, isLoading } = useGetMeQuery();

    if (isLoading || !data) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    return <ProfileForm user={data.user} />;
};

const ProfileForm = ({ user }: { user: MeUser }) => {
    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

    const [fname, setFname] = useState(user.fname);
    const [lname, setLname] = useState(user.lname);
    const [email, setEmail] = useState(user.contactEmail ?? '');
    const [phone, setPhone] = useState(user.phone ?? '');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const handleSave = async () => {
        setFeedback(null);
        if (!fname || !lname) {
            setFeedback({ type: 'error', msg: 'First and last name are required' });
            return;
        }
        try {
            await updateProfile({ fname, lname, email, phone }).unwrap();
            setFeedback({ type: 'success', msg: 'Profile saved' });
        } catch {
            setFeedback({ type: 'error', msg: 'Failed to save profile' });
        }
    };

    return (
        <Box sx={{ maxWidth: 480 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>My Profile</Typography>
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                    {feedback && <Alert severity={feedback.type}>{feedback.msg}</Alert>}
                    <TextField label="First Name" value={fname} onChange={(e) => setFname(e.target.value)} required />
                    <TextField label="Last Name" value={lname} onChange={(e) => setLname(e.target.value)} required />
                    <TextField label="Contact Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <Typography variant="caption" color="text.secondary">Login email: {user.email}</Typography>
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