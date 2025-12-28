// src/app/stores/page.tsx

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Stores with SVD</h1>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-lg text-gray-700 mb-4">
            Browse stores offering Scheduled Visit Discounts in your area.
          </p>
          <p className="text-gray-600">
            Coming soon: Store directory with real-time availability and SVD offers.
          </p>
        </div>
      </div>
    </div>
  );
}