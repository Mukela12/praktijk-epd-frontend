import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AllClients = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new ClientManagement component
    navigate('/dashboard/admin/client-management', { replace: true });
  }, [navigate]);
  
  return null;
};

export default AllClients;