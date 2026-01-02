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

  // const alignClasses = {
  //   top: {
  //     start: 'left-4',
  //     center: 'left-1/2 -translate-x-1/2',
  //     end: 'right-4',
  //   },
  //   bottom: {
  //     start: 'left-4',
  //     center: 'left-1/2 -translate-x-1/2',
  //     end: 'right-4',
  //   },
  //   left: {
  //     start: 'top-4',
  //     center: 'top-1/2 -translate-y-1/2',
  //     end: 'bottom-4',
  //   },
  //   right: {
  //     start: 'top-4',
  //     center: 'top-1/2 -translate-y-1/2',
  //     end: 'bottom-4',
  //   },
  // };
  const alignClasses = {
    top: 'left-1/2 -translate-x-1/2',
    bottom: 'left-1/2 -translate-x-1/2',
    left: 'top-4',
    right: 'top-4',
  };

  return (
    <span
      className={`absolute h-2 w-2 rotate-45 border-b-1 border-l-1 border-slate-300 bg-white ${sideClasses[side]} ${alignClasses[side]} `}
    />
  );
};

export default TooltipArrow;
