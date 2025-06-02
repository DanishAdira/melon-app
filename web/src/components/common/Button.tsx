import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
children,
type = "button",
className,
...props
}) => {
return (
    <button
    type={type}
    className={className}
    {...props}
    >
    {children}
    </button>
);
};

export default Button;