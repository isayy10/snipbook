'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    axios.get(`http://localhost:5000/api/bookings/customer/${parsedUser.user_id}`)
      .then(res => {
        setBookings(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [router]);
    const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reviews/add', {
        appointment_id: selectedBooking.appointment_id,
        customer_id: user.user_id,
        shop_id: selectedBooking.shop_id,
        rating: rating,
        comment: comment
      });
      toast.success('Review submitted successfully!');
      setReviewModal(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to submit review.');
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading bookings...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* Kanang bahagi: User Info */}
          <span className="text-gray-600 font-medium">Hi, {user?.full_name || 'Customer'}</span>
          
        </div>
      </nav>  

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Appointments</h1>

        {bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            You have no bookings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.appointment_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{booking.shop.shop_name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{booking.shop.address}</p>
                  <p className="text-blue-600 font-medium">{booking.service.service_name}</p>
                  <p className="text-gray-700 text-sm mt-1">
                    📅 {new Date(booking.appointment_date).toLocaleDateString()} at {booking.appointment_time}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2
                    ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {booking.status}
                  </span>
                  <p className="text-lg font-bold text-gray-900">₱{booking.total_amount}</p>
                  <div className="mt-4 bg-white p-2 border rounded-lg inline-block">
                    <QRCode value={booking.qr_code || 'no-code'} size={80} />
                  </div>
                    {booking.status === 'COMPLETED' && !booking.review && (
                    <button 
                      onClick={() => { setSelectedBooking(booking); setReviewModal(true); }}
                      className="mt-4 w-full bg-yellow-500 text-white px-4 py-2 rounded font-medium hover:bg-yellow-600 transition"
                    >
                      Leave a Review ⭐
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REVIEW MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea required value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" rows={3} placeholder="How was your experience?"></textarea>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setReviewModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300">Cancel</button>
                <button type="submit" className="flex-1 bg-yellow-500 text-white py-2 rounded font-medium hover:bg-yellow-600">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}