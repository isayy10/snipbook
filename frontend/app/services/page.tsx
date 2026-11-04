'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then(res => {
        setServices(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">SnipBook</Link>
          <Link href="/" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition shadow-sm">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Services</h1>
          <p className="text-gray-600">Browse grooming services offered by top barbershops.</p>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500">No services available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.service_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{service.service_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {service.shop.shop_name} ({service.shop.city})</p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg">
                    ₱{service.price}
                  </span>
                </div>
                
                <p className="text-gray-500 text-sm mb-6">⏱ {service.duration_minutes} mins</p>
                
                <Link 
                  href={`/shop/${service.shop.shop_id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  View Shop & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}