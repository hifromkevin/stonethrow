import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders button with label', () => {
      render(<Button label="Click me" />);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as a link when href is provided', () => {
      render(<Button label="Go to page" href="/dashboard" />);
      const link = screen.getByRole('link', { name: 'Go to page' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('renders as disabled button when href provided but disabled', () => {
      render(<Button label="Disabled link" href="/page" disabled />);
      const button = screen.getByRole('button', { name: 'Disabled link' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button label="Primary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--color-primary)]');
    });

    it('applies secondary variant styles when specified', () => {
      render(<Button label="Secondary" variant="secondary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-slate-500');
    });
  });

  describe('button type', () => {
    it('defaults to type="button"', () => {
      render(<Button label="Default" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('sets type="submit" when specified', () => {
      render(<Button label="Submit" type="submit" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button label="Disabled" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is not disabled by default', () => {
      render(<Button label="Enabled" />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('click handler', () => {
    it('calls clickFn when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button label="Click me" clickFn={handleClick} />);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call clickFn when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button label="Disabled" clickFn={handleClick} disabled />);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('link behavior', () => {
    it('sets target="_blank" by default for links', () => {
      render(<Button label="External" href="https://example.com" />);
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('allows overriding target for links', () => {
      render(<Button label="Internal" href="/page" target="_self" />);
      expect(screen.getByRole('link')).toHaveAttribute('target', '_self');
    });
  });

  describe('custom styles', () => {
    it('applies override classes', () => {
      render(<Button label="Custom" overrides="w-full mt-4" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('mt-4');
    });
  });
});
