//src/app/dashboard/store/payment-pending/page.tsx

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Almost there!</h1>
        <p className="text-gray-600 mb-6">
          Your store account has been created, but your dashboard unlocks once payment has been
          received. If you've already made a bank transfer, this usually takes a short while to
          confirm — feel free to reach out if it's been longer than expected.
        </p>
        <p className="text-sm text-gray-500">
          Contact: mind@horistics.com &nbsp;·&nbsp; +45 27 13 44 83
        </p>
      </div>
    </div>
  );
}