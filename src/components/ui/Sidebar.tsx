const Sidebar = ({ size = 'default' }: { size?: 'default' | 'large' }) => (
  <div
    className={`absolute inset-y-0 left-0 w-[${size === 'default' ? '3px' : '4px'}] bg-[var(--color-primary)]`}
  />
);
export default Sidebar;
