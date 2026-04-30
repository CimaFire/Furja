import React from 'react';

function VideoPlayer({ stream }) {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {stream.hls_url ? (
        <video
          controls
          style={{ width: '100%', height: '100%' }}
          src={stream.hls_url}
          className="w-full h-full"
        />
      ) : (
        <div className="text-gray-400 flex flex-col items-center space-y-4">
          <span className="text-6xl">📹</span>
          <p className="text-xl">البث غير متاح حالياً</p>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
