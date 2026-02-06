import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import FocusCard from '../FocusCard';

// Mock useFocus hook
const mockUseFocus = vi.fn();
vi.mock('@/lib/queries/useFocus', () => ({
  default: () => mockUseFocus(),
}));

// Mock useSetFocus hook
const mockMutateAsync = vi.fn();
vi.mock('@/lib/mutations/useSetFocus', () => ({
  default: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('FocusCard', () => {
  const mockSetFocusStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFocus.mockReturnValue({ data: null });
  });

  describe('empty state', () => {
    it('renders prompt text when empty', () => {
      render(
        <FocusCard focusStatus="empty" setFocusStatus={mockSetFocusStatus} />
      );
      expect(screen.getByText('What matters most right now?')).toBeInTheDocument();
    });

    it('renders subtitle when empty', () => {
      render(
        <FocusCard focusStatus="empty" setFocusStatus={mockSetFocusStatus} />
      );
      expect(
        screen.getByText('Set a focus to prioritize your day')
      ).toBeInTheDocument();
    });

    it('shows red indicator dot when empty', () => {
      render(
        <FocusCard focusStatus="empty" setFocusStatus={mockSetFocusStatus} />
      );
      const dot = document.querySelector('.bg-red-400');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('committed state', () => {
    beforeEach(() => {
      mockUseFocus.mockReturnValue({
        data: { statement: 'Learn TypeScript fundamentals' },
      });
    });

    it('displays the persisted focus text', () => {
      render(
        <FocusCard focusStatus="committed" setFocusStatus={mockSetFocusStatus} />
      );
      expect(
        screen.getByText('Learn TypeScript fundamentals')
      ).toBeInTheDocument();
    });

    it('syncs persisted focus on load', () => {
      render(
        <FocusCard focusStatus="empty" setFocusStatus={mockSetFocusStatus} />
      );
      expect(mockSetFocusStatus).toHaveBeenCalledWith('committed');
    });
  });

  describe('editing mode', () => {
    it('enters editing mode when clicked', async () => {
      const user = userEvent.setup();
      render(
        <FocusCard focusStatus="empty" setFocusStatus={mockSetFocusStatus} />
      );

      await user.click(screen.getByText('What matters most right now?'));
      expect(mockSetFocusStatus).toHaveBeenCalledWith('editing');
    });

    it('shows textarea in editing mode', () => {
      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );
      expect(
        screen.getByPlaceholderText('Write your focus here…')
      ).toBeInTheDocument();
    });

    it('shows Save Focus button in editing mode', () => {
      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );
      expect(
        screen.getByRole('button', { name: 'Save Focus' })
      ).toBeInTheDocument();
    });

    it('shows Cancel button in editing mode', () => {
      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('saving focus', () => {
    it('calls setFocus mutation on save', async () => {
      mockMutateAsync.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      const textarea = screen.getByPlaceholderText('Write your focus here…');
      await user.type(textarea, 'Build a test suite');
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      expect(mockMutateAsync).toHaveBeenCalledWith('Build a test suite');
    });

    it('sets status to committed on successful save', async () => {
      mockMutateAsync.mockResolvedValue({ ok: true });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      const textarea = screen.getByPlaceholderText('Write your focus here…');
      await user.type(textarea, 'Build a test suite');
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      await waitFor(() => {
        expect(mockSetFocusStatus).toHaveBeenCalledWith('committed');
      });
    });

    it('sets status to empty when saving empty text', async () => {
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      // Don't type anything, just save
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      expect(mockSetFocusStatus).toHaveBeenCalledWith('empty');
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('safety errors', () => {
    it('displays safety error message', async () => {
      mockMutateAsync.mockResolvedValue({
        ok: false,
        error: 'UNSAFE_FOCUS',
        rejection_reason: 'This focus contains inappropriate content.',
        alternatives: [],
      });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      const textarea = screen.getByPlaceholderText('Write your focus here…');
      await user.type(textarea, 'Bad focus');
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      await waitFor(() => {
        expect(
          screen.getByText('This focus contains inappropriate content.')
        ).toBeInTheDocument();
      });
    });

    it('displays alternative suggestions', async () => {
      mockMutateAsync.mockResolvedValue({
        ok: false,
        error: 'UNSAFE_FOCUS',
        rejection_reason: 'Focus rejected.',
        alternatives: ['Learn web development', 'Build a portfolio'],
      });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      const textarea = screen.getByPlaceholderText('Write your focus here…');
      await user.type(textarea, 'Bad focus');
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      await waitFor(() => {
        expect(screen.getByText('Learn web development')).toBeInTheDocument();
        expect(screen.getByText('Build a portfolio')).toBeInTheDocument();
      });
    });

    it('fills textarea with alternative when clicked', async () => {
      mockMutateAsync.mockResolvedValue({
        ok: false,
        error: 'UNSAFE_FOCUS',
        rejection_reason: 'Focus rejected.',
        alternatives: ['Learn web development'],
      });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      const textarea = screen.getByPlaceholderText('Write your focus here…');
      await user.type(textarea, 'Bad focus');
      await user.click(screen.getByRole('button', { name: 'Save Focus' }));

      await waitFor(() => {
        expect(screen.getByText('Learn web development')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Learn web development'));

      // After clicking alternative, error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText('Focus rejected.')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('cancel behavior', () => {
    it('cancels to committed state when focus exists', async () => {
      mockUseFocus.mockReturnValue({
        data: { statement: 'Existing focus' },
      });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockSetFocusStatus).toHaveBeenCalledWith('committed');
    });

    it('cancels to empty state when no focus exists', async () => {
      mockUseFocus.mockReturnValue({ data: null });
      const user = userEvent.setup();

      render(
        <FocusCard focusStatus="editing" setFocusStatus={mockSetFocusStatus} />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockSetFocusStatus).toHaveBeenCalledWith('empty');
    });
  });
});
