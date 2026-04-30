import React from 'react';

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-500">إنشاء حساب</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-pink-500"
              placeholder="اسم المستخدم"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-pink-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-pink-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-pink-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded transition"
          >
            إنشاء حساب
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          لديك حساب بالفعل؟ <a href="/login" className="text-pink-500 hover:underline">سجل دخول</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
