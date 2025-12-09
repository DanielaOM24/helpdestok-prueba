interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
    return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
    text: string;
    className?: string;
}

export const CardTitle = ({ text, className = '' }: CardTitleProps) => {
    return <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>{text}</h3>;
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
    return <div className={`text-gray-600 ${className}`}>{children}</div>;
};

