import { useState } from 'react';

import { ModalProps } from '@/types';
import Button from '@/components/ui/Button';
import addPebble from '@/app/actions/addPebble';
import { getAddPebbleErrorMessage } from '@/lib/errors/getAddPebbleErrorMessage';

const Modal = ({ isOpen, onClose, onSuccess }: ModalProps) => {
  if (!isOpen) return null;

  const [pebbleError, setPebbleError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose(false)}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2>Add a Pebble</h2>

        <form
          action={async (formData: FormData) => {
            const url = formData.get('url') as string;
            const result = await addPebble(url);

            // TODO: Loading state while waiting for response

            if (!result.ok) {
              setPebbleError(getAddPebbleErrorMessage(result?.error));
            } else {
              // TODO: Some sort of success indication send a Toast congratulating user
            }

            onClose(false);
            return;
          }}
        >
          <input
            name="url"
            type="url"
            required
            placeholder="Paste a link to an article or video here"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#5FA69A] focus:ring-2 focus:ring-[#5FA69A]/30 focus:outline-none"
          />

          {pebbleError && (
            <p className="mt-2 text-sm text-red-600">{pebbleError}</p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              label="Cancel"
              variant="secondary"
              clickFn={() => onClose(false)}
            />
            <Button type="submit" label="Add Pebble" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
