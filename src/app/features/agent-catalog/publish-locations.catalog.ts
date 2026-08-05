export interface CatalogPublishLocation {
  code: string;
  name: string;
  description: string;
  isAvailable: boolean;
  iconClass: string;
}

export const PUBLISH_LOCATIONS_CATALOG: CatalogPublishLocation[] = [
  {
    code: 'website',
    name: 'Tạo trang web',
    description: 'Bật/tắt kênh Website cho agent phục vụ chat trực tiếp trên trang web.',
    isAvailable: true,
    iconClass: 'bx bx-globe'
  },
  {
    code: 'facebook_fanpage',
    name: 'Fanpage Facebook',
    description: 'Kết nối Fanpage Facebook để agent tự động phản hồi tin nhắn.',
    isAvailable: false,
    iconClass: 'bx bxl-facebook-circle'
  },
  {
    code: 'zalo_oa',
    name: 'Zalo OA (Doanh nghiệp)',
    description: 'Tích hợp Zalo Official Account để phục vụ tin nhắn khách hàng.',
    isAvailable: false,
    iconClass: 'bx bx-chat'
  },
  {
    code: 'chatbot',
    name: 'Chatbot',
    description: 'Tích hợp kịch bản Chatbot tự động cho kênh hội thoại.',
    isAvailable: false,
    iconClass: 'bx bx-bot'
  },
  {
    code: 'zalo_personal',
    name: 'Zalo Cá nhân',
    description: 'Kết nối tài khoản Zalo cá nhân quản trị viên.',
    isAvailable: false,
    iconClass: 'bx bx-user-circle'
  }
];
