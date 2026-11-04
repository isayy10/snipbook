'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subStatus, setSubStatus] = useState<string>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [newPhoto, setNewPhoto] = useState({ image_url: '', style_name: '' });
  const [newService, setNewService] = useState({ service_name: '', price: '', duration_minutes: '', category: 'Haircut' });
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'SHOP_OWNER') {
      router.push('/'); 
      return;
    }
    setUser(parsedUser);

    // Fetch photos pagka-load ng dashboard
    axios.get(`http://localhost:5000/api/gallery/my-photos/${parsedUser.user_id}`)
      .then(res => setPhotos(res.data))
      .catch(err => console.error("Error fetching photos", err));

          // Fetch bookings
    axios.get(`http://localhost:5000/api/bookings/owner/${parsedUser.user_id}`)
      .then(res => setBookings(res.data))
      .catch(err => console.error("Error fetching bookings", err));
      
          // Fetch subscription status
    axios.get(`http://localhost:5000/api/subscription/status/${parsedUser.user_id}`)
      .then(res => setSubStatus(res.data.status))
      .catch(err => console.log("Error fetching sub status", err));

  }, [router]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/subscription/subscribe', {
        owner_id: user.user_id,
        plan: 'BASIC',
        amount: 2999
      });
      toast.success('Subscription Successful! Your shop is now ACTIVE.');
      setSubStatus('active'); 
    } catch (error) {
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/gallery/add', {
        owner_id: user.user_id,
        image_url: newPhoto.image_url,
        style_name: newPhoto.style_name
      });
      toast.success('Photo added successfully!');
      setNewPhoto({ image_url: '', style_name: '' });
      
      // Refresh photos para lumabas agad
      const res = await axios.get(`http://localhost:5000/api/gallery/my-photos/${user.user_id}`);
      setPhotos(res.data);
    } catch (error) {
      toast.error('Failed to add photo.');
    }
  };
      const handleDeletePhoto = (gallery_id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-800">Delete this photo?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(gallery_id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (gallery_id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/gallery/${gallery_id}`);
      toast.success('Photo deleted successfully! 🗑️');
      
      const res = await axios.get(`http://localhost:5000/api/gallery/my-photos/${user.user_id}`);
      setPhotos(res.data);
    } catch (error) {
      toast.error('Failed to delete photo.');
    }
  };
  
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/services/add', {
        owner_id: user.user_id,
        ...newService
      });
      toast.success('Service added successfully!');
      setNewService({ service_name: '', price: '', duration_minutes: '', category: 'Haircut' });
    } catch (error) {
      toast.error('Failed to add service.');
    }
  };
    const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus });
      // I-refresh yung listahan
      const res = await axios.get(`http://localhost:5000/api/bookings/owner/${user.user_id}`);
      setBookings(bookings.map(b => b.appointment_id === id ? { ...b, status: newStatus } : b));
      toast.success(`Booking marked as ${newStatus}!`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };
  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">SnipBook</h2>
        <nav className="space-y-4 grow">
          <Link href="#top" className="block text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-lg">Overview</Link>
          <Link href="#bookings" className="block text-gray-600 hover:text-blue-600 px-4 py-2">My Bookings</Link>
          <Link href="#gallery" className="block text-gray-600 hover:text-blue-600 px-4 py-2">Haircut Gallery</Link>
          <Link href="#subscription" className="block text-gray-600 hover:text-blue-600 px-4 py-2">Subscription</Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-200">
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-red-500 font-medium hover:text-red-700">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div id="top" className="grow p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}!</h1>
        </div>

        {/* Subscription Banner */}
        <div id="subscription"></div>
        {subStatus === 'active' ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r-lg">
            <p className="text-green-700 font-medium">Your subscription is ACTIVE!  You can now receive bookings.</p>
          </div>
        ) : subStatus === 'inactive' ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-yellow-700">
                Your subscription is <strong>inactive</strong>. Please subscribe to start receiving bookings.
              </p>
            </div>
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 disabled:bg-yellow-300"
            >
              {isLoading ? 'Processing...' : 'Subscribe Now (₱2,999)'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 border-l-4 border-gray-300 p-4 mb-8 rounded-r-lg">
            <p className="text-gray-500 font-medium">Checking subscription status...</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">₱0.00</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Gallery Photos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{photos.length}</p>
          </div>
        </div>

        {/* Add Photo Form */}
        <div id="gallery"></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-bold mb-4">Add Haircut to Gallery</h2>
          <form onSubmit={handleAddPhoto} className="flex gap-4 items-end">
            <div className="grow">
              <label className="block text-sm text-gray-600 mb-1">Image URL</label>
              <input 
                type="text" 
                required
                value={newPhoto.image_url}
                onChange={(e) => setNewPhoto({...newPhoto, image_url: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm text-gray-600 mb-1">Style Name</label>
              <input 
                type="text" 
                required
                value={newPhoto.style_name}
                onChange={(e) => setNewPhoto({...newPhoto, style_name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                placeholder="e.g. Low Fade"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm font-medium">
              Add Photo
            </button>
          </form>
        </div>
        {/* Add Service Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-bold mb-4">Add New Service</h2>
          <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Service Name</label>
              <input type="text" required value={newService.service_name} onChange={(e) => setNewService({...newService, service_name: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="e.g. Classic Haircut" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price (₱)</label>
              <input type="number" required value={newService.price} onChange={(e) => setNewService({...newService, price: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="250" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Duration (mins)</label>
              <input type="number" required value={newService.duration_minutes} onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="30" />
            </div>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-sm font-medium h-10">
              Add Service
            </button>
          </form>
        </div>
        {/* Display Gallery Photos */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">My Haircut Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
                          <div key={photo.gallery_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
                <img src={photo.image_url} alt={photo.style_name} className="w-full h-40 object-cover" />
                
                <div className="p-3 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">{photo.style_name}</h3>
                  <button 
                    onClick={() => handleDeletePhoto(photo.gallery_id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>  
            ))}
            {photos.length === 0 && (
              <p className="text-gray-500 col-span-4 text-center py-4">No photos added yet.</p>
            )}
          </div>
        </div>
        {/* MY BOOKINGS TABLE */}
        <div id= "bookings" className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-3 border-b">Customer</th>
                  <th className="p-3 border-b">Service</th>
                  <th className="p-3 border-b">Date & Time</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.appointment_id} className="border-b text-sm text-gray-700 hover:bg-gray-50">
                    <td className="p-3 font-medium">{booking.customer.full_name} <br/><span className="text-xs text-gray-400">{booking.customer.phone}</span></td>
                    <td className="p-3">{booking.service.service_name}</td>
                    <td className="p-3">{new Date(booking.appointment_date).toLocaleDateString()} <br/><span className="text-xs text-gray-400">{booking.appointment_time}</span></td>
                                        <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status}
                      </span>
                      
                      {/* DITO NA YUNG MGA BUTTONS */}
                      {booking.status === 'PENDING' && (
                        <button onClick={() => handleUpdateStatus(booking.appointment_id, 'CONFIRMED')} className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Confirm</button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button onClick={() => handleUpdateStatus(booking.appointment_id, 'COMPLETED')} className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Complete</button>
                      )}
                    </td>
                    <td className="p-3 font-bold text-blue-600">₱{booking.total_amount}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}