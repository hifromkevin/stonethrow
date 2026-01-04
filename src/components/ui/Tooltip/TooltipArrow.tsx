const TooltipArrow = ({
  side,
}: {
  side: 'top' | 'bottom' | 'left' | 'right';
}) => {
  const sideClasses = {
    top: 'bottom-[-4px]',
    bottom: 'top-[-4px]',
    left: 'right-[-4px]',
    right: 'left-[-4px]',
  };

  const alignClasses = {
    top: 'left-1/2 -translate-x-1/2',
    bottom: 'left-1/2 -translate-x-1/2',
    left: 'top-1/2 -translate-y-1/2',
    right: 'top-1/2 -translate-y-1/2',
  };

  return (
    <span
      className={`absolute h-2 w-2 rotate-45 bg-white ${sideClasses[side]} ${alignClasses[side]} `}
    />
  );
};

export default TooltipArrow;
