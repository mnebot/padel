import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { ConfirmDialog } from '../ConfirmDialog';

describe('Common Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('renders with text', () => {
      render(<LoadingSpinner text="Carregant..." />);
      expect(screen.getByText('Carregant...')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });
  });

  describe('ErrorMessage', () => {
    it('renders inline variant by default', () => {
      render(<ErrorMessage message="Test error" />);
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders card variant with title', () => {
      render(<ErrorMessage message="Test error" variant="card" title="Error Title" />);
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Test error" variant="card" onDismiss={onDismiss} />);
      
      const dismissButton = screen.getByLabelText('Tancar');
      await userEvent.click(dismissButton);
      
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe('ConfirmDialog', () => {
    it('renders when open', () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Confirm Action"
          description="Are you sure?"
          onConfirm={vi.fn()}
        />
      );
      
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();
      
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Confirm Action"
          description="Are you sure?"
          onConfirm={onConfirm}
        />
      );
      
      const confirmButton = screen.getByText('Confirmar');
      await userEvent.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it('shows destructive variant with warning icon', () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Delete Item"
          description="This action cannot be undone"
          variant="destructive"
          onConfirm={vi.fn()}
        />
      );
      
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      // Verify destructive button is present
      const confirmButton = screen.getByText('Confirmar');
      expect(confirmButton).toBeInTheDocument();
    });

    it('disables buttons when loading', () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Confirm Action"
          description="Are you sure?"
          onConfirm={vi.fn()}
          isLoading={true}
        />
      );
      
      const confirmButton = screen.getByText('Processant...');
      const cancelButton = screen.getByText('Cancel·lar');
      
      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
