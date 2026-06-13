import React from 'react';
import { Input } from './input';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        className={`${iconPosition === 'left' ? 'pl-10' : 'pr-10'} ${className}`}
        {...props}
      />
      {iconPosition === 'right' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
    </div>
  );
};
