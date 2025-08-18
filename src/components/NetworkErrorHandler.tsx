import React from 'react';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  return <>{children}</>;
};

export default NetworkErrorHandler;