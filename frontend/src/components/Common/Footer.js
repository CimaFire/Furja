import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-pink-500 font-bold mb-4">🎬 فُرجه</h3>
            <p className="text-gray-400">منصة البث المباشر الاحترافية</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">الروابط</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-pink-500">الرئيسية</a></li>
              <li><a href="#about" className="hover:text-pink-500">عن التطبيق</a></li>
              <li><a href="#contact" className="hover:text-pink-500">اتصل بنا</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">قانوني</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#privacy" className="hover:text-pink-500">سياسة الخصوصية</a></li>
              <li><a href="#terms" className="hover:text-pink-500">شروط الاستخدام</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 فُرجه. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
