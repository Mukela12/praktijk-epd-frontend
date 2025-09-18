import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ClientProvider } from './components/shared/ClientContext';

// Lazy load components for better performance
const ListView = React.lazy(() => import('./components/ListView/ClientList'));
const DetailView = React.lazy(() => import('./components/DetailView/ClientProfile'));
const CreateView = React.lazy(() => import('./components/Forms/CreateClient'));
const EditView = React.lazy(() => import('./components/Forms/EditClient'));

const ClientManagement: React.FC = () => {
  return (
    <ClientProvider>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/new" element={<CreateView />} />
          <Route path="/:id" element={<DetailView />} />
          <Route path="/:id/edit" element={<EditView />} />
          <Route path="*" element={<Navigate to="/admin/clients" replace />} />
        </Routes>
      </React.Suspense>
    </ClientProvider>
  );
};

export default ClientManagement;