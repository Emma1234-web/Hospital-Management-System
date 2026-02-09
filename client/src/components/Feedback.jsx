export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
      <div className="text-base font-semibold text-gray-800">{title}</div>
      {description && <div className="mt-1 text-sm">{description}</div>}
    </div>
  );
}
