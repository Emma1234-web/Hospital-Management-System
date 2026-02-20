export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
