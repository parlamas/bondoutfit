// src/app/contact/page.tsx

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-lg text-gray-700 mb-4">
            Have questions about SVD? Want to implement it in your store?
          </p>
          <p className="text-gray-600">
            Email: contact@bondoutfit.com
          </p>
        </div>
      </div>
    </div>
  );
}