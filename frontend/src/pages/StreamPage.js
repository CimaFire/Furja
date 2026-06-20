import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { streamsService } from '../services/api';
import VideoPlayer from '../components/Stream/VideoPlayer';
import ChatBox from '../components/Chat/ChatBox';

function StreamPage() {
  const { id } = useParams();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await streamsService.getStreamById(id);
        setStream(response.data);
      } catch (error) {
        console.error('Failed to fetch stream:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!stream) {
    return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على البث</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-6">
          {/* Video Player - 2/3 width */}
          <div className="col-span-2">
            <VideoPlayer stream={stream} />
            
            {/* Stream Info */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>
              <p className="text-gray-300 mb-4">{stream.description}</p>
              
              {/* Channel Info */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                {stream.avatar_url && (
                  <img
                    src={stream.avatar_url}
                    alt={stream.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-bold text-lg">{stream.username}</p>
                  <p className="text-gray-400">المشاهدون: {stream.viewer_count}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat - 1/3 width */}
          <div>
            <ChatBox streamId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamPage;
