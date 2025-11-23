import Picture from '@components/atoms/Picture/Picture';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Picture> = {
    component: Picture,
    argTypes: {
        src: {
            control: 'text',
            description: 'Image source URL',
            defaultValue: 'https://via.placeholder.com/150',
        },
        alt: {
            control: 'text',
            description: 'Image alt text',
            defaultValue: 'Placeholder image',
        },
        className: {
            control: 'text',
            description: 'Custom CSS class name',
            defaultValue: '',
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
            description: 'Image size',
            defaultValue: 'medium',
        },
    },
};

export default meta;

type Story = StoryObj<typeof Picture>;

export const Default: Story = {
    args: {
        src: 'https://placehold.co/300x300',
        alt: 'Placeholder image',
        className: '',
        size: 'medium',
    },
};

export const StupidoSexyCactua: Story = {
    args: {
        ...Default.args,
        alt: 'Stupido Sexy Cactua',
        src: 'https://cdn.bsky.app/img/avatar/plain/did:plc:iog4wlzjmahlm3wicd4squk6/bafkreicl7kbg4gndq5l6eygnoiev65v5ruxdr6uvfgnmciczbfibiwdrhu@jpeg'
    },
};