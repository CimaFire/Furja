import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { streamsService } from '../services/api';
import { setStreams, setLoading } from '../store/slices/streamsSlice';
import StreamCard from '../components/Stream/StreamCard';

function Home() {
  const dispatch = useDispatch();
  const { streams, isLoading } = useSelector(state => state.streams);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchStreams = async () => {
      dispatch(setLoading(true));
      try {
        const response = await streamsService.getActiveStreams();
        dispatch(setStreams(response.data));
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStreams();
    // Refresh every 5 seconds
    const interval = setInterval(fetchStreams, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">🎬 مرحباً بك في فُرجه</h1>
          <p className="text-xl text-gray-300">منصة البث المباشر الاحترافية</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded transition ${
              filter === 'all'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded transition ${
              filter === 'live'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            بث مباشر
          </button>
          <button
            onClick={() => setFilter('gaming')}
            className={`px-4 py-2 rounded transition ${
              filter === 'gaming'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ألعاب
          </button>
        </div>

        {/* Streams Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">جاري تحميل البث...</p>
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map(stream => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">لا توجد بث مباشر الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
