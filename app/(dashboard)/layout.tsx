export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nextgen-dark-blue via-nextgen-medium-gray to-nextgen-dark-blue">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
