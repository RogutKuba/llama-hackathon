export const AppContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-4 bg-white min-h-screen ${className}`}>{children}</div>
  );
};
