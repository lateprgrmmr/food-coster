import { Box, TextField, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../lib/api';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [error, setError] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');

    const navigate = useNavigate();
    const [register, { isLoading }] = useRegisterMutation();

    const handleRegister = async () => {
        if (!email || !password || !organizationName || !fname || !lname) {
            setError('All fields are required');
            return;
        }
        try {
            const data = await register({ email, password, organizationName, fname, lname }).unwrap();
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (error) {
            setError('Failed to register');
            console.error(error);
        }
    };

    return (
        <Box>
            <Typography variant="h1">Register</Typography>
            <TextField label="First Name" value={fname} onChange={(e) => setFname(e.target.value)} error={!!error} helperText={error} />
            <TextField label="Last Name" value={lname} onChange={(e) => setLname(e.target.value)} error={!!error} helperText={error} />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} helperText={error} />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} helperText={error} />
            <TextField label="Organization Name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} error={!!error} helperText={error} />
            <Button variant="contained" color="primary" onClick={handleRegister} disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</Button>
            <Typography variant="body1" color="text.secondary">Already have an account? <Link to="/login">Login</Link></Typography>
            {error && <Typography variant="body1" color="error">{error}</Typography>}
        </Box>
    );
}