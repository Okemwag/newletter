import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-violet-600 via-blue-600 to-pink-600 text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5',
  secondary: 'bg-violet-600/10 text-violet-600 border-2 border-violet-600 backdrop-blur-sm hover:bg-violet-600/20 hover:-translate-y-0.5',
  ghost: 'bg-transparent text-slate-50 border border-violet-600/20 hover:bg-violet-600/10 hover:border-violet-600',
};

const sizeStyles = {
  sm: 'px-4 py-1 text-sm rounded-lg',
  md: 'px-6 py-2 text-base rounded-xl',
  lg: 'px-8 py-3 text-lg rounded-2xl',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick,
  type = 'button',
  className = ''
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`font-heading font-semibold border-none cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 relative overflow-hidden ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}