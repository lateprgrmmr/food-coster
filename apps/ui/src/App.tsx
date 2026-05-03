import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;