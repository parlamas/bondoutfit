//src/app/schedule/[storeId]/BookingForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VisitImageUpload from '@/app/components/VisitImageUpload';
import { translations, Lang } from './translations';

interface BookingFormProps {
  storeId: string;
  storeName: string;
}

interface UploadedImage {
  url: string;
  publicId: string;
}

export default function BookingForm({ storeId, storeName }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [lang, setLang] = useState<Lang>('en');
  const t = translations[lang];

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    numberOfPeople: '1',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customer/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          numberOfPeople: parseInt(formData.numberOfPeople),
          notes: formData.notes,
          inspirationImages: inspirationImages.map(img => img.url),
          inspirationImageIds: inspirationImages.map(img => img.publicId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book visit');
      }

      router.push('/dashboard/customer/visits?booking=success');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Generate available time slots (9 AM to 6 PM, hourly)
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get tomorrow's date as min for date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t.bookVisitAt(storeName)}</h2>
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'da' : 'en')}
          className="text-sm text-gray-500 underline"
        >
          {lang === 'en' ? 'Dansk' : 'English'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            {t.date}
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            min={minDate}
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            {t.time}
          </label>
          <select
            id="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t.selectTime}</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 mb-1">
          {t.numberOfPeople}
        </label>
        <select
          id="numberOfPeople"
          name="numberOfPeople"
          required
          value={formData.numberOfPeople}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} {num === 1 ? t.person : t.people}</option>
          ))}
        </select>
      </div>

      {/* Image Upload Section */}
      <VisitImageUpload 
        onImagesChange={setInspirationImages}
        maxImages={3}
      />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          {t.notesLabel}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder={t.notesPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t.bookingButton : t.bookButton}
      </button>
    </form>
  );
}
