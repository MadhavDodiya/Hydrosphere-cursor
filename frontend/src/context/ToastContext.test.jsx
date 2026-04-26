import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast('Error message', 'error')}>Show Error Toast</button>
      <button onClick={() => showToast('Success message', 'success')}>Show Success Toast</button>
      <button onClick={() => showToast('')}>Empty Message</button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <ToastProvider>
        <div>Test Child</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Child')).toBeDefined();
  });

  it('throws error if useToast is used outside provider', () => {
    // Suppress console.error for expected error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useToast must be used within ToastProvider');

    consoleError.mockRestore();
  });

  it('shows and hides error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Toast should not be visible initially
    expect(screen.queryByRole('status')).toBeNull();

    // Show error toast
    fireEvent.click(screen.getByText('Show Error Toast'));

    // Toast should be visible
    const toastContainer = screen.getByRole('status');
    expect(toastContainer).not.toBeNull();
    expect(screen.getByText('Error message')).not.toBeNull();
    expect(document.querySelector('.hs-toast-error')).not.toBeNull();
    expect(document.querySelector('.bi-exclamation-circle-fill')).not.toBeNull();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Toast should be hidden
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows and hides success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show success toast
    fireEvent.click(screen.getByText('Show Success Toast'));

    // Toast should be visible
    const toastContainer = screen.getByRole('status');
    expect(toastContainer).not.toBeNull();
    expect(screen.getByText('Success message')).not.toBeNull();
    expect(document.querySelector('.hs-toast-success')).not.toBeNull();
    expect(document.querySelector('.bi-check-circle-fill')).not.toBeNull();

    // Click close button
    fireEvent.click(document.querySelector('.btn-close'));

    // Toast should be hidden
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('ignores empty message', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Empty Message'));

    // Toast should not be visible
    expect(screen.queryByRole('status')).toBeNull();
  });
});
