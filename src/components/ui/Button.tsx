import { JSX } from 'react';

interface ButtonProps {
    text: string;
    icon?: JSX.Element | string;
    disabled?: boolean;
    loading?: boolean;
    click?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export const Button = ({
    text,
    icon,
    disabled = false,
    loading = false,
    click,
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
}: ButtonProps) => {
    const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

    return (
        <button
            type={type}
            onClick={click}
            className={classes}
            disabled={disabled || loading}
        >
            <div>{loading ? 'Cargando...' : text}</div>
            {icon && <div>{icon}</div>}
        </button>
    );
};

