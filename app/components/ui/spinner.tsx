import React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <div 
      className={`animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full ${className || ''}`}
      {...props}
    />
  );
}; 