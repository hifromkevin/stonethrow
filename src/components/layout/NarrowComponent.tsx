const NarrowComponent = ({
  adtlStyles,
  children,
}: {
  adtlStyles?: string;
  children: React.ReactNode;
}) => (
  <main className={`mx-8 w-full max-w-4xl ${adtlStyles ? adtlStyles : ''}`}>
    {children}
  </main>
);
export default NarrowComponent;
