import Picture from '@/components/moleculas/BdgFront/BdgFront';
import BdgFront from '@/components/moleculas/BdgFront/BdgFront';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BdgFront> = {
    component: BdgFront,
    argTypes: {
    },
};

export default meta;

type Story = StoryObj<typeof BdgFront>;

export const Default: Story = {
    args: {
        imageUrl: 'https://placehold.co/300x300',
        size: 'medium',
        role: 'badge-front',
    },
};