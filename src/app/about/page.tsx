//src/app/about/page.tsx

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About SVD</h1>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-lg text-gray-700 mb-4">
            Scheduled Visit Discount (SVD) is a revolutionary marketing concept that bridges 
            the gap between online engagement and physical store visits.
          </p>
          <p className="text-lg text-gray-700">
            For customers: Schedule store visits in advance and get exclusive discounts.
            For store managers: Attract guaranteed foot traffic during specific time slots.
          </p>
        </div>
      </div>
    </div>
  );
}