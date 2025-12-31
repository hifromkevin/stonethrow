import { ModalProps } from '@/types';
import Button from '../ui/Button';

const Modal = ({ isOpen, onClose, action }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose(false)}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2>Add a Pebble</h2>

        <input
          type="url"
          placeholder="Paste a link to an article or video here"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[#5FA69A] focus:ring-2 focus:ring-[#5FA69A]/30 focus:outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button
            label="Cancel"
            variant="secondary"
            clickFn={() => onClose(false)}
          />
          <Button
            label="Set Focus"
            clickFn={() => {
              onClose(true);
              action();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;
