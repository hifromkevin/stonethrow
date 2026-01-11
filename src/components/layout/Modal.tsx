'use client';

import { useState } from 'react';

import { ModalProps } from '@/types';
import Button from '@/components/ui/Button';
import useAddPebble from '@/lib/mutations/useAddPebble';
import { getAddPebbleErrorMessage } from '@/lib/errors/getAddPebbleErrorMessage';

import { AddPebbleSuccess, AddPebbleFailure } from '@/types';

const Modal = ({ isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;

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
      />

      <div className="relative z-10 w-full max-w-md rounded-md bg-white p-6 shadow-xl">
        <h2>Add a Pebble</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="url"
            type="url"
            required
            placeholder="Paste a link to an article or video here"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
            disabled={isPending}
          />

          {pebbleError && (
            <p className="mt-2 text-sm text-red-600">{pebbleError}</p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              clickFn={() => onClose(false)}
              disabled={isPending}
            />
            <Button
              type="submit"
              label={isPending ? 'Adding…' : 'Add Pebble'}
              disabled={isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
