const NarrowComponent = ({
  adtlStyles,
  children,
}: {
  adtlStyles?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={`mx-8 w-full max-w-4xl ${adtlStyles ? adtlStyles : ''}`}>
      {children}
    </div>
  );
};
export default NarrowComponent;
