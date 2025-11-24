import './badge.scss';

import React from 'react';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    onClick,
    ...props
}) => {
    const classes = [
        'badge',
        `badge--${variant}`,
        `badge--${size}`,
        className
    ].join(' ');

    return (
        <span
            className={classes}
            onClick={onClick}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;