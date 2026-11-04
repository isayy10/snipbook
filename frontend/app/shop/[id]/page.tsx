'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // State para sa booking
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    if (params.id) {
      axios.get(`http://localhost:5000/api/shops/${params.id}`)
        .then(res => {
          setShop(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [params.id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.success('Please log in first to book an appointment.');
      router.push('/login');
      return;
    }
    
    setIsBooking(true);
    try {
      await axios.post('http://localhost:5000/api/bookings/create', {
        customer_id: user.user_id,
        shop_id: shop.shop_id,
        service_id: selectedService.service_id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        total_amount: selectedService.price
      });
      
      toast.success('Booking Successful! Your appointment is pending confirmation.');
      setSelectedService(null); // Isara ang modal
    } catch (error) {
      toast.error('Failed to book appointment.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading shop details...</div>;
  if (!shop) return <div className="p-10 text-center text-red-500">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
          {/* Navbar */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          
          {/* Kaliwang bahagi: Logo at Back Button */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-blue-600">SnipBook</Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
              ← Back to Home
            </Link>
          </div>

          {/* Kanang bahagi: User Info at My Bookings */}
          {user && (
            <div className="flex items-center gap-6">
              <Link href="/my-bookings" className="text-blue-600 font-medium hover:text-blue-800">My Bookings</Link>
              <span className="text-gray-600 font-medium">Hi, {user.full_name.split(' ')[0]}</span>
            </div>
          )}
          
        </div>
      </nav>
      

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{shop.shop_name}</h1>
          <p className="text-gray-500 mb-4">📍 {shop.address}, {shop.city}</p>
        </div>

        {/* Haircut Gallery */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Haircut Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shop.gallery.map((photo: any) => (
              <div key={photo.gallery_id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img src={photo.image_url} alt={photo.style_name} className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="font-medium text-gray-800">{photo.style_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services & Booking */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
          <div className="space-y-4">
            {shop.services.map((service: any) => (
              <div key={service.service_id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{service.service_name}</h3>
                  <p className="text-gray-500 text-sm">{service.duration_minutes} mins</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-blue-600">₱{service.price}</div>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
            {shop.services.length === 0 && <p className="text-gray-500">No services listed yet.</p>}
          </div>
        </div>
                {/* GOOGLE MAPS INTEGRATION */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${shop.address}, ${shop.city}&output=embed`}
            ></iframe>
          </div>
        </div>
      </main>

      {/* BOOKING MODAL (Lalabas kapag pinindot ang Book) */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Book {selectedService.service_name}</h2>
            <p className="text-gray-600 mb-6">Price: ₱{selectedService.price}</p>
            
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input type="time" required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setSelectedService(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isBooking} className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-blue-400">
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}