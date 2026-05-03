import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
      <Route path="/register" element={<div>Register</div>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;