import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiHome, FiUserCheck, FiGrid } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';

function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-pink-500">🎬 فُرجه</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-pink-500 transition">
              <FiHome /> <span>الرئيسية</span>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 hover:text-pink-500 transition">
                  <FiGrid /> <span>لوحة التحكم</span>
                </Link>
                <Link to={`/profile/${user.id}`} className="flex items-center space-x-1 hover:text-pink-500 transition">
                  <FiUserCheck /> <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  <FiLogOut /> <span>خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-pink-500 transition">دخول</Link>
                <Link to="/register" className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 transition">تسجيل</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
