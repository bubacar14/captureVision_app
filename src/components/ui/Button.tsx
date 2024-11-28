import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'btn text-gray-700 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || disabled}
      className={classNames(
        variants[variant],
        sizes[size],
        'relative inline-flex items-center justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      <span className={classNames('flex items-center gap-2', { 'opacity-0': isLoading })}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </motion.button>
  );
}
