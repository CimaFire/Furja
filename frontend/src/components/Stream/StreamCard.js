import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTrendingUp } from 'react-icons/fi';

function StreamCard({ stream }) {
  return (
    <Link
      to={`/stream/${stream.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform"
    >
      {/* Thumbnail */}
      <div className="relative pb-[56.25%] bg-gray-700">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span className="text-4xl">🎥</span>
          </div>
        )}
        {/* Live Badge */}
        {stream.status === 'live' && (
          <div className="absolute top-2 right-2 bg-red-600 px-3 py-1 rounded-full flex items-center space-x-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-sm font-bold">مباشر</span>
          </div>
        )}
        {/* Viewers */}
        <div className="absolute bottom-2 left-2 bg-black/50 px-3 py-1 rounded text-sm flex items-center space-x-1">
          <FiUsers className="w-4 h-4" />
          <span>{stream.viewer_count}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{stream.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{stream.description}</p>
        
        {/* Channel Info */}
        <div className="flex items-center space-x-3 pt-3 border-t border-gray-700">
          {stream.avatar_url ? (
            <img
              src={stream.avatar_url}
              alt={stream.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold">
              {stream.username?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{stream.username}</p>
            <p className="text-gray-500 text-xs">{stream.viewer_count} متفرج</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default StreamCard;
