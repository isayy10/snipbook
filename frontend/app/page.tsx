'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Kunin ang active shops mula sa backend
    axios.get('http://localhost:5000/api/shops')
      .then(res => {
        setShops(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch shops", err);
        setIsLoading(false);
      });

    // Fetch Strapi Announcement
    axios.get('http://localhost:1337/api/announcements')
      .then(res => {
        if (res.data.data && res.data.data.length > 0) {
          setAnnouncement(res.data.data[0]); 
        }
      })
      .catch(err => console.log("Strapi error:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">SnipBook</Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#barbershops" className="text-gray-600 hover:text-blue-600 font-medium">Barbershops</a>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 font-medium">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">Hi, {user.full_name.split(' ')[0]}!</span>
                  <Link href="/my-bookings" className="text-blue-600 font-medium hover:text-blue-800 mr-4">My Bookings</Link>
                  {user.role === 'SHOP_OWNER' && (
                    <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Log in</Link>
                  <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        {announcement && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 max-w-7xl mx-auto mt-4 rounded shadow-sm">
            <p className="font-bold text-lg">{announcement.title}</p>
            <p>{announcement.message}</p>
          </div>
        )}

        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Find your perfect cut,</span>{' '}
                <span className="block text-blue-600 xl:inline">book in seconds.</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl md:mt-5 md:text-xl">
                SnipBook connects you with the best barbershops in town. Browse styles, compare prices, and book your next appointment online.
              </p>
              <div className="mt-8 sm:max-w-lg sm:w-full flex gap-2">
                <input 
                  type="text" 
                  placeholder="Search by city or barbershop name..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">Search</button>
              </div>
            </div>
          </div>
        </div>

        {/* Real Barbershops Directory */}
        <div id="barbershops" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Barbershops</h2>
          
          {isLoading ? (
            <p>Loading shops...</p>
          ) : shops.length === 0 ? (
            <p className="text-gray-500">No active barbershops found yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shops.map((shop) => (
                <div key={shop.shop_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                  {shop.gallery && shop.gallery.length > 0 ? (
                    <img src={shop.gallery[0].image_url} alt={shop.shop_name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  <div className="p-4 flex flex-col grow">
                    <h3 className="font-bold text-lg text-gray-900">{shop.shop_name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{shop.city}</p>
                    <div className="flex items-center gap-1 mb-4 mt-auto">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-gray-400">(Mock Reviews)</span>
                    </div>
                    <Link href={`/shop/${shop.shop_id}`} className="w-full text-center block bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}