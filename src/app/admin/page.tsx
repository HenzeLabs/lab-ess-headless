export const revalidate = 60;

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        This is a lightweight admin index used for local testing of the admin
        layout and footer rendering.
      </p>
      <div className="mt-8">Welcome to the admin area.</div>
    </div>
  );
}
// Note: AdminDashboard export removed to avoid duplicate default export.
