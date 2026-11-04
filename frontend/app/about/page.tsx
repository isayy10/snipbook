'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">SnipBook</Link>
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium hover:bg-gray-200 transition">← Back to Home</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About SnipBook</h1>
        <p className="text-lg text-gray-600 mb-6">
          SnipBook is the leading multi-barbershop platform that connects customers with the best local barbers. We provide a seamless booking experience, showcase top haircut styles, and help barbershops grow their business online.
        </p>
        <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl text-left mt-10">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Our Mission</h2>
          <p className="text-gray-700">To empower local barbershops with digital tools they need to succeed, while giving customers the easiest way to look their best.</p>
        </div>
      </main>
    </div>
  );
}