import './picture.scss';

import React from 'react';

import Image from 'next/image';

export interface PictureProps {
    src: string;
    alt: string;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

const Picture: React.FC<PictureProps> = ({
    src,
    alt,
    className = '',
    size = 'medium',
}) => {

    const sizes = {
        small: 80,
        medium: 100,
        large: 150,
    }

    const sizeClass = `picture--size-${size}`;

    return (
        <picture className={`picture ${className} ${sizeClass}`} >
            <Image
                src={src}
                alt={alt}
                width={sizes[size]}
                height={sizes[size]}
                loading="lazy"
                decoding="async"
            />
        </picture>
    );
};

export default Picture;
