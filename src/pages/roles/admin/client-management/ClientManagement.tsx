import React from 'react';
import { Outlet } from 'react-router-dom';
import { ClientProvider } from './components/shared/ClientContext';

const ClientManagement: React.FC = () => {
  return (
    <ClientProvider>
      <Outlet />
    </ClientProvider>
  );
};

export default ClientManagement;