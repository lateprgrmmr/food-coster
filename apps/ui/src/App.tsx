import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <div>
              Dashboard
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;