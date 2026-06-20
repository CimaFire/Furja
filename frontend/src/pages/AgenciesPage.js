import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { agenciesService } from '../../services/api';

const AgenciesPage = () => {
  const { user } = useSelector(state => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: '',
    agencyType: 'talent',
    businessRegistration: '',
    contactEmail: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await agenciesService.register(formData);
      alert('وكالة مسجلة بنجاح!');
      setShowForm(false);
      setFormData({ agencyName: '', agencyType: 'talent', businessRegistration: '', contactEmail: '' });
    } catch (error) {
      alert('فشل تسجيل الوكالة');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🏢 الوكالات</h1>
          {user?.is_broadcaster && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-lg font-bold"
            >
              + إنشاء وكالة
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
            <input
              type="text"
              placeholder="اسم الوكالة"
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
              required
            />
            <select
              value={formData.agencyType}
              onChange={(e) => setFormData({ ...formData, agencyType: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
            >
              <option value="talent">وكالة مواهب</option>
              <option value="entertainment">ترفيه</option>
              <option value="streaming">بث</option>
            </select>
            <input
              type="text"
              placeholder="رقم التسجيل التجاري"
              value={formData.businessRegistration}
              onChange={(e) => setFormData({ ...formData, businessRegistration: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
              required
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded">
              حفظ
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🎬 وكالات النجوم</h3>
            <p className="text-sm opacity-90">تجميع أفضل المبثين على المنصة</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">💰 العائدات المشتركة</h3>
            <p className="text-sm opacity-90">احصل على نسبة من عائدات موثقيك</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">📊 التحليلات</h3>
            <p className="text-sm opacity-90">تابع أداء وكالتك وموثقيك</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenciesPage;
