// T025 [P] [US1] API service cho kênh Instagram Business

export interface MetaAccountInfo {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ValidPage {
  facebookPageId: string;
  facebookPageName: string;
  facebookPageAvatarUrl?: string;
  instagramBusinessAccountId: string;
  instagramUsername: string;
  instagramAccountType: 'BUSINESS' | 'CREATOR';
  currentStatus: 'not_connected' | 'already_connected_this_agent';
}

export interface InvalidPage {
  facebookPageId: string;
  facebookPageName: string;
  facebookPageAvatarUrl?: string;
  reason: 'connected_by_other_agent';
  connectedByAgentName: string;
}

export interface ConnectionResultResponse {
  valid: ValidPage[];
  invalid: InvalidPage[];
  metaAccountInfo: MetaAccountInfo;
}

export interface InstagramConnection {
  connectionId: string;
  facebookPageId: string;
  facebookPageName: string;
  facebookPageAvatarUrl?: string;
  instagramUsername: string;
  instagramAccountType: string;
  status: 'active' | 'disconnected' | 'error';
  connectedAt: string;
}

export interface ConnectionGroup {
  metaAccountConnectionId: string;
  metaUserName: string;
  metaUserAvatarUrl?: string;
  pages: InstagramConnection[];
}

export interface ListConnectionsResponse {
  isPublished: boolean;
  accounts: ConnectionGroup[];
  activeHoursConfig?: string;
}

const API_BASE = '/api/channels/instagram';

export async function initiateConnect(agentId: string): Promise<{ oauthUrl: string; state: string }> {
  const res = await fetch(`${API_BASE}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId })
  });
  if (!res.ok) throw new Error('Không thể khởi tạo kết nối OAuth Meta');
  return res.json();
}

export async function getConnectionResult(sessionKey: string): Promise<ConnectionResultResponse> {
  const res = await fetch(`${API_BASE}/connect/result?sessionKey=${encodeURIComponent(sessionKey)}`);
  if (!res.ok) throw new Error('Không thể lấy kết quả phân loại trang Meta');
  return res.json();
}

export async function confirmPages(
  agentId: string,
  sessionKey: string,
  selectedPageIds: string[]
): Promise<{ connectedCount: number }> {
  const res = await fetch(`${API_BASE}/pages/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, sessionKey, selectedPageIds })
  });
  if (res.status === 409) throw new Error('Trang bạn chọn vừa được kết nối bởi một agent khác');
  if (!res.ok) throw new Error('Xác nhận kết nối trang thất bại');
  return res.json();
}

export async function listConnections(agentId: string): Promise<ListConnectionsResponse> {
  const res = await fetch(`${API_BASE}/connections?agentId=${encodeURIComponent(agentId)}`);
  if (!res.ok) throw new Error('Không thể lấy danh sách kết nối Instagram');
  return res.json();
}

export async function disconnectPage(connectionId: string, agentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/connections/${encodeURIComponent(connectionId)}?agentId=${encodeURIComponent(agentId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Ngắt kết nối thất bại');
}
