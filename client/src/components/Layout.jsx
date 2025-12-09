
export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
