import React from 'react';
import { useSelector } from 'react-redux';

function Dashboard() {
  const { user } = useSelector(state => state.auth);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">الرجاء تسجيل الدخول أولاً</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">إجمالي المشاهدات</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">الدخل</p>
            <p className="text-3xl font-bold">$0.00</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">المتابعون</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Start Stream Button */}
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">ابدأ البث الآن</h2>
          <p className="text-gray-400 mb-6">استخدم البيانات التالية لبدء البث</p>
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded transition">
            ابدأ البث
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
