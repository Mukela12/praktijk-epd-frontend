import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TherapistProvider } from './components/shared/TherapistContext';

// Lazy load components for better performance
const ListView = React.lazy(() => import('./components/ListView/TherapistList'));
const DetailView = React.lazy(() => import('./components/DetailView/TherapistProfile'));
const CreateView = React.lazy(() => import('./components/CreateView/CreateWizard'));
const EditView = React.lazy(() => import('./components/EditView/EditForm'));

const TherapistManagement: React.FC = () => {
  console.log('🚀 NEW Therapist Management System Loaded - Version 2.0');
  
  return (
    <TherapistProvider>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/new" element={<CreateView />} />
          <Route path="/:id" element={<DetailView />} />
          <Route path="/:id/edit" element={<EditView />} />
          <Route path="*" element={<Navigate to="/admin/therapists" replace />} />
        </Routes>
      </React.Suspense>
    </TherapistProvider>
  );
};

export default TherapistManagement;