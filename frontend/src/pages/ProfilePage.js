import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersService } from '../../services/api';

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, streamsRes] = await Promise.all([
          usersService.getUserById(id),
          usersService.getUserStreams(id)
        ]);
        setUser(userRes.data);
        setStreams(streamsRes.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على المستخدم</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
              <p className="text-gray-400 mb-4">{user.bio || 'لا توجد سيرة ذاتية'}</p>
              <div className="flex space-x-4">
                <div>
                  <p className="text-gray-400 text-sm">عدد البث</p>
                  <p className="text-2xl font-bold">{streams.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">التاريخ</p>
                  <p className="text-2xl font-bold">2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streams */}
        <div>
          <h2 className="text-2xl font-bold mb-6">البث</h2>
          {streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stream cards here */}
            </div>
          ) : (
            <p className="text-gray-400">لم ينشر هذا المستخدم أي بث بعد</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
