import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

interface NavigateOptions {
  state?: any;
  replace?: boolean;
}

/**
 * @deprecated Use regular useNavigate instead. This hook caused timing issues.
 * 
 * Custom hook that wraps useNavigate to ensure smooth transitions
 * by deferring navigation until after React's render cycle
 */
export const useNavigateWithTransition = () => {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string, options?: NavigateOptions) => {
    // DEPRECATED: Direct navigation without requestAnimationFrame
    // The requestAnimationFrame was causing race conditions
    navigate(to, options);
  }, [navigate]);

  return navigateWithTransition;
};