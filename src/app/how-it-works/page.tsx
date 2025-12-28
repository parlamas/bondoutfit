// src/app/how-it-works/page.tsx

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">How SVD Works</h1>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">1. Store Announces SVD</h2>
            <p>Store managers create time-specific discount offers for scheduled visits.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">2. Customer Schedules Visit</h2>
            <p>Customers browse available time slots and book their visit through BondOutfit.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">3. Customer Visits Store</h2>
            <p>Customer shows up at the scheduled time and checks in at the store.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">4. Discount Applied</h2>
            <p>Store applies the pre-announced discount to the customer's purchase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}