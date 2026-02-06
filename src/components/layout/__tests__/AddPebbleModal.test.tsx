import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import AddPebbleModal from '../AddPebbleModal';

// Mock useAddPebble hook
const mockMutate = vi.fn();
vi.mock('@/lib/mutations/useAddPebble', () => ({
  default: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('AddPebbleModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when closed', () => {
    it('renders nothing when isOpen is false', () => {
      render(<AddPebbleModal isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('when open', () => {
    it('renders the modal dialog', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders the title "Add a Pebble"', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Add a Pebble')).toBeInTheDocument();
    });

    it('renders URL input field', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/paste a link/i)).toBeInTheDocument();
    });

    it('renders Cancel and Add Pebble buttons', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Pebble' })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls addPebble mutation with URL on submit', async () => {
      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/paste a link/i);
      await user.type(input, 'https://example.com/article');
      await user.click(screen.getByRole('button', { name: 'Add Pebble' }));

      expect(mockMutate).toHaveBeenCalledWith(
        'https://example.com/article',
        expect.any(Object)
      );
    });

    it('closes modal on successful submission', async () => {
      mockMutate.mockImplementation((_, options) => {
        options.onSuccess({ ok: true, data: [] });
      });

      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/paste a link/i);
      await user.type(input, 'https://example.com/article');
      await user.click(screen.getByRole('button', { name: 'Add Pebble' }));

      expect(mockOnClose).toHaveBeenCalledWith(false);
    });

    it('displays error message on failure response', async () => {
      mockMutate.mockImplementation((_, options) => {
        options.onSuccess({ ok: false, error: 'DUPLICATE' });
      });

      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/paste a link/i);
      await user.type(input, 'https://example.com/article');
      await user.click(screen.getByRole('button', { name: 'Add Pebble' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/already saved this link/i)).toBeInTheDocument();
    });

    it('displays generic error on network failure', async () => {
      mockMutate.mockImplementation((_, options) => {
        options.onError(new Error('Network error'));
      });

      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/paste a link/i);
      await user.type(input, 'https://example.com/article');
      await user.click(screen.getByRole('button', { name: 'Add Pebble' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('cancel behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnClose).toHaveBeenCalledWith(false);
    });

    it('calls onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);

      // Click the backdrop (the dark overlay)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledWith(false);
      }
    });
  });

  describe('accessibility', () => {
    it('has accessible dialog role', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-labelledby pointing to title', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      const dialog = screen.getByRole('dialog');
      const labelId = dialog.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId!)).toHaveTextContent('Add a Pebble');
    });

    it('URL input is required', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/paste a link/i)).toBeRequired();
    });

    it('URL input has type="url"', () => {
      render(<AddPebbleModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByPlaceholderText(/paste a link/i)).toHaveAttribute(
        'type',
        'url'
      );
    });
  });
});
