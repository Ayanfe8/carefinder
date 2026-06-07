import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminEntryForm } from '@/components/admin/AdminEntryForm';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function NewHospitalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Hospital</h1>
        <ErrorBoundary>
          <AdminEntryForm />
        </ErrorBoundary>
      </main>
    </div>
  );
}
