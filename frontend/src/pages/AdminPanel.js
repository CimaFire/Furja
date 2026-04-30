import React from 'react';

function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">لوحة الإدارة</h1>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">إجمالي المستخدمين</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">البث النشط</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">الإيرادات</p>
            <p className="text-3xl font-bold">$0.00</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">الإبلاغات</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">إدارة المستخدمين</h2>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded transition">
              عرض المستخدمين
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">الإبلاغات</h2>
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded transition">
              عرض الإبلاغات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
