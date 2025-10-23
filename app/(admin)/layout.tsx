import { AdminSidebar } from "./_components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                PeriodQuiz 管理画面
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
