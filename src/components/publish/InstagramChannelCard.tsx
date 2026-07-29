import React, { useState } from 'react';
import { initiateConnect } from '../../api/instagram-channel';

interface InstagramChannelCardProps {
  agentId: string;
}

// T023 [P] [US1] Frontend Component InstagramChannelCard
export const InstagramChannelCard: React.FC<InstagramChannelCardProps> = ({ agentId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const { oauthUrl } = await initiateConnect(agentId);
      window.location.href = oauthUrl;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi khởi tạo kết nối Meta OAuth');
      setLoading(false);
    }
  };

  return (
    <div className="instagram-channel-card border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
          IG
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Instagram Business</h3>
          <p className="text-sm text-gray-500">Tự động trả lời Direct Message (DM) khách hàng 24/7</p>
        </div>
      </div>

      <div className="steps-guide bg-gray-50 p-4 rounded-md mb-4 text-sm text-gray-700 space-y-2">
        <h4 className="font-medium text-gray-900">Hướng dẫn 3 bước kết nối:</h4>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Đảm bảo tài khoản Instagram của bạn là <b>Business/Creator</b>.</li>
          <li>Liên kết trang Instagram với <b>Fanpage Facebook</b> của bạn.</li>
          <li>Bấm nút bên dưới để đăng nhập Facebook và cấp quyền nhắn tin.</li>
        </ol>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-2.5 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? 'Đang kết nối...' : 'Kết nối ngay'}
      </button>
    </div>
  );
};
