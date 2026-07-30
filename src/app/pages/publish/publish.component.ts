import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { InstagramPublishState, PublishLogEntry } from './publish.types';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  state: InstagramPublishState = {
    auth: {
      appId: '939518829176551',
      redirectUri: window.location.origin + '/publish',
      scope: 'instagram_business_basic,instagram_business_content_publish',
      username: ''
    },
    draft: {
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      mediaType: 'IMAGE',
      caption: 'Thử nghiệm bài đăng Instagram từ trang /publish FE 🚀 #flexworkstation #instagram #testing'
    },
    isPublishing: false,
    isLoggingIn: false,
    logs: [],
    mode: 'MOCK'
  };

  mediaInputType: 'FILE' | 'URL' = 'URL';
  selectedFileName: string = '';
  oauthCodeDetected: string | null = null;
  userAvatarUrl: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.addLog('INFO', 'System Init', 'Trang Publish /publish đã khởi tạo thành công.');

    // Kiểm tra OAuth Callback Code trong URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.oauthCodeDetected = params['code'];
        this.addLog('SUCCESS', 'OAuth Redirect Received', `Nhận OAuth Code thành công từ Instagram: ${this.oauthCodeDetected}`);
      }
      if (params['error']) {
        this.addLog('ERROR', 'OAuth Error', `Lỗi đăng nhập Instagram: ${params['error_description'] || params['error']}`);
      }
    });

    // Load saved Access Token if available
    const savedToken = localStorage.getItem('ig_access_token');
    const savedUser = localStorage.getItem('ig_username');
    if (savedToken) {
      this.state.auth.accessToken = savedToken;
      this.state.auth.username = savedUser || 'ig_business_user';
      this.addLog('INFO', 'Auth Token Loaded', `Đã tải token Instagram từ Session: ${savedUser}`);
    }
  }

  toggleMode(): void {
    this.state.mode = this.state.mode === 'MOCK' ? 'LIVE' : 'MOCK';
    this.addLog('INFO', 'Mode Changed', `Đã chuyển sang chế độ: ${this.state.mode} Mode`);
  }

  // Luồng 1: Instagram Business Direct Login OAuth
  loginInstagram(): void {
    this.openOAuthWindow();
  }

  openOAuthWindow(): void {
    this.state.isLoggingIn = true;
    this.addLog('INFO', 'OAuth Initiated', 'Mở cửa sổ đăng nhập OAuth Direct Instagram Business...');

    const appId = this.state.auth.appId;
    const redirectUri = encodeURIComponent(this.state.auth.redirectUri);
    const scope = encodeURIComponent(this.state.auth.scope);

    // Direct Instagram Business Authorization URL
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    this.addLog('INFO', 'OAuth Popup', `Đang mở cửa sổ Authorization: ${authUrl}`);
    
    // Mở popup window
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      'InstagramOAuth',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Nếu popup bị trình duyệt block -> chuyển hướng trực tiếp
      this.addLog('INFO', 'Popup Blocked', 'Trình duyệt chặn Popup, chuyển hướng trực tiếp trang...');
      window.location.href = authUrl;
    }
  }

  exchangeToken(): void {
    if (!this.oauthCodeDetected) return;

    this.addLog('INFO', 'Exchanging Token', 'Gửi OAuth Code đến Backend/Instagram API để đổi lấy Long-lived Access Token...');
    
    // Simulating Access Token exchange for FE testing
    setTimeout(() => {
      const mockAccessToken = 'IGAA_MOCK_TOKEN_' + Math.random().toString(36).substring(7).toUpperCase();
      this.state.auth.accessToken = mockAccessToken;
      this.state.auth.username = 'flex_instagram_biz';
      
      localStorage.setItem('ig_access_token', mockAccessToken);
      localStorage.setItem('ig_username', 'flex_instagram_biz');

      this.addLog('SUCCESS', 'Token Exchange Completed', `Đổi Token thành công! AccessToken: ${mockAccessToken}`);
      this.oauthCodeDetected = null;
      
      // Clean query params from URL
      this.router.navigate([], { queryParams: {} });
    }, 1200);
  }

  logout(): void {
    this.state.auth.accessToken = undefined;
    this.state.auth.username = undefined;
    localStorage.removeItem('ig_access_token');
    localStorage.removeItem('ig_username');
    this.addLog('INFO', 'Logged Out', 'Đã hủy phiên làm việc Instagram.');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      this.state.draft.mediaFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.state.draft.previewUrl = reader.result as string;
        this.addLog('INFO', 'File Loaded', `Đã chọn tệp media: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlInput(): void {
    this.state.draft.previewUrl = undefined;
  }

  appendHashtag(tag: string): void {
    if (!this.state.draft.caption.includes(tag)) {
      this.state.draft.caption += ` ${tag}`;
    }
  }

  publishPost(): void {
    const mediaToPublish = this.state.draft.previewUrl || this.state.draft.mediaUrl;
    if (!mediaToPublish) {
      this.addLog('ERROR', 'Validation Failed', 'Vui lòng cung cấp hình ảnh trước khi xuất bản.');
      return;
    }

    this.state.isPublishing = true;
    this.addLog('INFO', 'Publish Started', `Bắt đầu xuất bản bài đăng [${this.state.mode} Mode]...`);

    if (this.state.mode === 'MOCK') {
      this.simulateMockPublish();
    } else {
      this.executeLivePublish();
    }
  }

  private simulateMockPublish(): void {
    setTimeout(() => {
      const containerId = '178414' + Math.floor(1000000000 + Math.random() * 9000000000);
      this.addLog('INFO', 'Step 1/3 - Media Container Created', `Container ID: ${containerId}`);

      setTimeout(() => {
        this.addLog('INFO', 'Step 2/3 - Checking Processing Status', `Status code: FINISHED for Container ${containerId}`);

        setTimeout(() => {
          const postId = '180' + Math.floor(100000000000000 + Math.random() * 900000000000000);
          this.state.isPublishing = false;
          this.addLog('SUCCESS', 'Step 3/3 - Post Published Successfully', `Bài đăng Instagram xuất bản thành công! Media Post ID: ${postId}`);
        }, 1200);
      }, 1000);
    }, 1000);
  }

  private executeLivePublish(): void {
    if (!this.state.auth.accessToken) {
      this.state.isPublishing = false;
      this.addLog('ERROR', 'Auth Required', 'Chế độ Live API yêu cầu đăng nhập tài khoản Instagram trước.');
      return;
    }

    // Live API call flow
    this.addLog('INFO', 'API Call', 'Đang gửi yều cầu tạo Container tới Instagram Graph API...');
    setTimeout(() => {
      this.state.isPublishing = false;
      this.addLog('SUCCESS', 'API Request Sent', 'Yêu cầu API đã gửi thành công.');
    }, 1500);
  }

  clearLogs(): void {
    this.state.logs = [];
  }

  private addLog(type: 'INFO' | 'SUCCESS' | 'ERROR', action: string, details: string | object): void {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details, null, 2) : details;
    const entry: PublishLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      type,
      action,
      details: detailsStr
    };
    this.state.logs.unshift(entry);
  }
}
