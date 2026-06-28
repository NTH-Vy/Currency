// app/Admin/layout.tsx
import AdminHeader from "./header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05050a]">
      {/* Background hiệu ứng hạt/lưới nếu muốn */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      
      <AdminHeader />
      
      <main className="max-w-[1400px] mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}