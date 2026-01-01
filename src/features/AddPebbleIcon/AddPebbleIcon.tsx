const AddPebbleIcon = ({ handleClick }: { handleClick: () => void }) => (
  <div className="rounded-full bg-[var(--color-primary)] p-3 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-slate-300/80">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-6 w-6 text-white"
      onClick={handleClick}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </div>
);

export default AddPebbleIcon;
