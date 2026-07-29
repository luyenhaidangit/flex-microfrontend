import React, { useEffect, useState } from 'react';
import { ConnectionResultResponse, ListConnectionsResponse, getConnectionResult, listConnections } from '../../api/instagram-channel';
import { InstagramChannelCard } from './InstagramChannelCard';
import { ConnectionResultModal } from './ConnectionResultModal';
import { InstagramConnectedState } from './InstagramConnectedState';

interface PublishScreenProps {
  agentId: string;
}

// T026 + T042 [US1 + US3] PublishScreen Integration Component
export const PublishScreen: React.FC<PublishScreenProps> = ({ agentId }) => {
  const [connectionsData, setConnectionsData] = useState<ListConnectionsResponse | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [modalResult, setModalResult] = useState<ConnectionResultResponse | null>(null);

  const fetchConnections = async () => {
    try {
      const data = await listConnections(agentId);
      setConnectionsData(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchConnections();

    // Check URL params for sessionKey from OAuth callback redirect
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('sessionKey');
    if (key) {
      setSessionKey(key);
      getConnectionResult(key).then(setModalResult).catch(console.error);
    }
  }, [agentId]);

  return (
    <div className="publish-screen max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Phát hành Agent qua các kênh</h2>

      {connectionsData?.isPublished ? (
        <InstagramConnectedState
          agentId={agentId}
          connectionsData={connectionsData}
          onRefresh={fetchConnections}
        />
      ) : (
        <InstagramChannelCard agentId={agentId} />
      )}

      {sessionKey && modalResult && (
        <ConnectionResultModal
          agentId={agentId}
          sessionKey={sessionKey}
          result={modalResult}
          onClose={() => {
            setSessionKey(null);
            setModalResult(null);
          }}
          onSuccess={() => {
            setSessionKey(null);
            setModalResult(null);
            fetchConnections();
          }}
        />
      )}
    </div>
  );
};
