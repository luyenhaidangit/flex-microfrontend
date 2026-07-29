import React, { useState } from 'react';
import { ListConnectionsResponse, disconnectPage, initiateConnect } from '../../api/instagram-channel';

interface InstagramConnectedStateProps {
  agentId: string;
  connectionsData: ListConnectionsResponse;
  onRefresh: () => void;
}

// T041 [P] [US3] Frontend Component InstagramConnectedState
export const InstagramConnectedState: React.FC<InstagramConnectedStateProps> = ({
  agentId,
  connectionsData,
  onRefresh
}) => {
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const handleDisconnect = async (connectionId: string, pageName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ngắt kết nối Instagram page "${pageName}"?`)) return;

    try {
      setDisconnectingId(connectionId);
      await disconnectPage(connectionId, agentId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Ngắt kết nối thất bại');
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleAddAccount = async () => {
    const { oauthUrl } = await initiateConnect(agentId);
    window.location.href = oauthUrl;
  };

  return (
    <div className="instagram-connected-state border rounded-lg p-6 bg-white shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
            IG
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Instagram Business</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Đã phát hành
            </span>
          </div>
        </div>
        <button
          onClick={handleAddAccount}
          className="px-3 py-1.5 text-xs font-medium bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-md border border-pink-200 transition-colors"
        >
          + Thêm tài khoản Meta
        </button>
      </div>

      <div className="accounts-list space-y-4">
        {connectionsData.accounts.map(acc => (
          <div key={acc.metaAccountConnectionId} className="border rounded-md p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-3">Tài khoản Meta: {acc.metaUserName}</p>
            <div className="space-y-2">
              {acc.pages.map(page => (
                <div key={page.connectionId} className="flex justify-between items-center bg-white p-3 rounded border">
                  <div>
                    <p className="font-medium text-gray-900">@{page.instagramUsername}</p>
                    <p className="text-xs text-gray-500">Facebook Page: {page.facebookPageName}</p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(page.connectionId, page.facebookPageName)}
                    disabled={disconnectingId === page.connectionId}
                    className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 transition-colors"
                  >
                    {disconnectingId === page.connectionId ? 'Đang ngắt...' : 'Ngắt kết nối'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
