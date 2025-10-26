import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';
import { Button } from '../../ui/Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  render: () => (
    <PageHeader
      title="Tickets"
      subtitle="23 tickets encontrados"
      actions={(
        <>
          <Button variant="secondary">Exportar</Button>
          <Button variant="primary">Novo Ticket</Button>
        </>
      )}
    />
  ),
};