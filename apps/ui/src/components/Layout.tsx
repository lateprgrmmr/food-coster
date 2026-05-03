import { Box, AppBar, Toolbar, Typography, ListItem, ListItemButton, Drawer, List, ListItemText, ListItemIcon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Receipt as ReceiptIcon,
    Business as VendorsIcon,
    Category as CategoriesIcon,
    LocationOn as LocationsIcon,
    Person as UsersIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

export const Layout = ({ children }: { children: React.ReactNode }) => {

    const navigate = useNavigate();

    const navLinks = [
        {
            label: 'Dashboard',
            path: '/',
            icon: <DashboardIcon />,
        },
        {
            label: 'Invoices',
            path: '/invoices',
            icon: <ReceiptIcon />,
        },
        {
            label: 'Vendors',
            path: '/vendors',
            icon: <VendorsIcon />,
        },
        {
            label: 'Categories',
            path: '/categories',
            icon: <CategoriesIcon />,
        },
        {
            label: 'Locations',
            path: '/locations',
            icon: <LocationsIcon />,
        },
        {
            label: 'Users',
            path: '/users',
            icon: <UsersIcon />,
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: <SettingsIcon />,
        },
        {
            label: 'Logout',
            path: '/logout',
            icon: <LogoutIcon />,
            onClick: () => {
                localStorage.removeItem('token');
                navigate('/login');
            },
        },
    ]
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6">FoodCoster</Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
                <Toolbar />
                <List>
                    {navLinks.map((link) => (
                        <ListItem key={link.path} disablePadding>
                            <ListItemButton onClick={link.onClick ? link.onClick : () => navigate(link.path)}>
                                <ListItemIcon>
                                    {link.icon}
                                </ListItemIcon>
                                <ListItemText primary={link.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px`, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
}