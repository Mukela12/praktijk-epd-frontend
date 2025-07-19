import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

interface PageTransitionProps {
  children: React.ReactNode;
  show?: boolean;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  show = true, 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skip transitions on first mount to avoid blank screen issues
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Transition
      show={show}
      appear={true}
      enter="transition-all duration-300 ease-out"
      enterFrom="opacity-0 scale-95 translate-y-2"
      enterTo="opacity-100 scale-100 translate-y-0"
      leave="transition-all duration-200 ease-in"
      leaveFrom="opacity-100 scale-100 translate-y-0"
      leaveTo="opacity-0 scale-95 -translate-y-2"
    >
      <div className={className}>
        {children}
      </div>
    </Transition>
  );
};

export default PageTransition;