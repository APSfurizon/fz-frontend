import type { Meta, StoryObj } from '@storybook/react';
import Badge from '@/components/atoms/Badge/Badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: {
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'primary',
    size: 'medium',
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'] as const).map((variant) => (
        <Badge key={variant} variant={variant} size={args.size}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)} Badge
        </Badge>
      ))}
    </div>
  ),
  args: {
    size: 'medium',
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <Badge key={size} variant={args.variant} size={size}>
          {size.charAt(0).toUpperCase() + size.slice(1)} Badge
        </Badge>
      ))}
    </div>
  ),
  args: {
    variant: 'primary',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Clickable Badge',
    onClick: () => alert('Badge clicked!'),
  },
};