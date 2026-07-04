import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Layout } from './components/Layout';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Profile } from './pages/Profile';
import { Vendors } from './pages/Vendors';
import { VendorDetail } from './pages/VendorDetail';
import { NewInvoice } from './pages/NewInvoice';

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>Dashboard</Layout>
        </ProtectedRoute>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <Invoices />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/invoices/:id" element={
        <ProtectedRoute>
          <Layout>
            <InvoiceDetail />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/invoices/new" element={
        <ProtectedRoute>
          <Layout>
            <NewInvoice />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendors" element={
        <ProtectedRoute>
          <Layout>
            <Vendors />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendors/:id" element={
        <ProtectedRoute>
          <Layout>
            <VendorDetail />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;