import React, { useState } from 'react';
import { ConnectionResultResponse, confirmPages } from '../../api/instagram-channel';

interface ConnectionResultModalProps {
  agentId: string;
  sessionKey: string;
  result: ConnectionResultResponse;
  onClose: () => void;
  onSuccess: () => void;
}

// T024 [P] [US1] Frontend Component ConnectionResultModal (2 Tabs: Hợp lệ / Không hợp lệ)
export const ConnectionResultModal: React.FC<ConnectionResultModalProps> = ({
  agentId,
  sessionKey,
  result,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    result.valid.map(v => v.facebookPageId)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 trang Instagram để kết nối');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await confirmPages(agentId, sessionKey, selectedIds);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Xác nhận kết nối thất bại');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Kết quả kết nối Meta</h3>
            <p className="text-xs text-gray-500">Tài khoản: {result.metaAccountInfo.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b text-sm font-medium">
          <button
            onClick={() => setActiveTab('valid')}
            className={`flex-1 py-3 text-center border-b-2 ${
              activeTab === 'valid'
                ? 'border-pink-600 text-pink-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Hợp lệ ({result.valid.length})
          </button>
          <button
            onClick={() => setActiveTab('invalid')}
            className={`flex-1 py-3 text-center border-b-2 ${
              activeTab === 'invalid'
                ? 'border-pink-600 text-pink-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Không hợp lệ ({result.invalid.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {activeTab === 'valid' ? (
            result.valid.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Không tìm thấy tài khoản Instagram Business/Creator hợp lệ nào.</p>
            ) : (
              <div className="space-y-3">
                {result.valid.map(page => (
                  <label
                    key={page.facebookPageId}
                    className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(page.facebookPageId)}
                      onChange={() => toggleSelect(page.facebookPageId)}
                      className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">@{page.instagramUsername}</p>
                      <p className="text-xs text-gray-500">Facebook Page: {page.facebookPageName}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                      {page.instagramAccountType}
                    </span>
                  </label>
                ))}
              </div>
            )
          ) : (
            result.invalid.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Không có trang bị trùng lặp hay không hợp lệ.</p>
            ) : (
              <div className="space-y-3">
                {result.invalid.map(page => (
                  <div key={page.facebookPageId} className="p-3 border rounded-md bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{page.facebookPageName}</p>
                      <p className="text-xs text-red-600">Đã được kết nối bởi agent khác ({page.connectedByAgentName})</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded font-medium">Không thể chọn</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Hủy
          </button>
          {activeTab === 'valid' && result.valid.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-pink-600 hover:bg-pink-700 text-white rounded-md disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Xác nhận kết nối'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
