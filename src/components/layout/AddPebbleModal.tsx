'use client';

import { useState, useId } from 'react';
import Button from '@/components/ui/Button';
import useAddPebble from '@/lib/mutations/useAddPebble';
import { getAddPebbleErrorMessage } from '@/lib/errors/getAddPebbleErrorMessage';
import {
  AddPebbleModalProps,
  AddPebbleSuccess,
  AddPebbleFailure,
} from '@/types';

const AddPebbleModal = ({ isOpen, onClose }: AddPebbleModalProps) => {
  if (!isOpen) return null;

  const titleId = useId();
  const errorId = useId();

  const [pebbleError, setPebbleError] = useState<string | null>(null);
  const { mutate: addPebble, isPending } = useAddPebble();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPebbleError(null);

    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;

    addPebble(url, {
      onSuccess: (result: AddPebbleSuccess | AddPebbleFailure) => {
        if (!result.ok) {
          setPebbleError(getAddPebbleErrorMessage(result.error));
          return;
        }
        onClose(false);
      },
      onError: () => {
        setPebbleError('Something went wrong. Please try again.');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose(false)}
        aria-hidden="true"
      />

      <dialog
        open
        aria-labelledby={titleId}
        aria-describedby={pebbleError ? errorId : undefined}
        className="relative z-10 w-full max-w-md rounded-md bg-white p-6 shadow-xl"
      >
        <header className="mb-4">
          <h2 id={titleId} className="text-lg font-semibold">
            Add a Pebble
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="pebble-url" className="sr-only">
            Pebble URL
          </label>

          <input
            id="pebble-url"
            name="url"
            type="url"
            required
            placeholder="Paste a link to an article or video here"
            disabled={isPending}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
          />

          {pebbleError && (
            <p id={errorId} role="alert" className="text-sm text-red-600">
              {pebbleError}
            </p>
          )}

          <footer className="flex justify-end gap-3 pt-2">
            <Button
              label="Cancel"
              variant="secondary"
              clickFn={() => onClose(false)}
              disabled={isPending}
            />
            <Button
              type="submit"
              label={isPending ? 'Adding...' : 'Add Pebble'}
              disabled={isPending}
            />
          </footer>
        </form>
      </dialog>
    </div>
  );
};

export default AddPebbleModal;
