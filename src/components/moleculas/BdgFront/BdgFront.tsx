import './bdg-front.scss';

import React from 'react';

import Badge from '@components/atoms/Badge/Badge';
import MyPicture from '@components/atoms/Picture/Picture';

export interface PictureProps {
    imageUrl: string;
    role: string;
    size: 'small' | 'medium' | 'large';
}

const Picture: React.FC<PictureProps> = ({
    imageUrl,
    role,
    size = 'medium',
}) => {

    const sizes = {
        small: 80,
        medium: 100,
        large: 150,
    }

    const sizeClass = `bdg-front--size-${size}`;

    return (
        <div className={`bdg-front ${sizeClass}`} >
            {imageUrl && <MyPicture
                src={imageUrl}
                alt={role ? `Image with role ${role}` : 'Image'}
                size={size}
            />}
            {role && <Badge size={size}>{role}</Badge>}
        </div>
    );
};

export default Picture;
