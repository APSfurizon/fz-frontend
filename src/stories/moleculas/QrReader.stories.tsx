import QrReader from '@components/moleculas/QrReader/QrReader';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof QrReader> = {
    component: QrReader,
    argTypes: {
    },
};

export default meta;

type Story = StoryObj<typeof QrReader>;
export const Default: Story = {
    
};