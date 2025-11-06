import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function ProtectedRoute({ children }) {
  const token = authAPI.getToken();
  const provider = authAPI.getProvider();

  if (!token || !provider) {
    return <Navigate to="/provider/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

