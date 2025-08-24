import { Query, ListState, PageMeta } from 'src/app/core/features/query';

export abstract class EntityListComponent<TFilter> {
  state: ListState<TFilter>;

  protected constructor(initFilter: TFilter) {
    this.state = Query.init(initFilter, { index: 1, size: 10 });
  }

  /**
   * Utility function để loại bỏ các giá trị null, undefined, empty string
   * @param params Object chứa các tham số cần clean
   * @returns Object đã được clean, chỉ giữ lại các giá trị hợp lệ
   */
  protected cleanParams<T extends Record<string, any>>(params: T): Partial<T> {
    const cleaned: Partial<T> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string' && value.trim() === '') return;
        cleaned[key as keyof T] = value;
      }
    });
    
    return cleaned;
  }

  resetToFirstPage(): void {
    this.state.paging.index = 1;
  }

  onPageChange(page: number, searchFn: () => void): void {
    if (page === this.state.paging.index) return;
    this.state.paging.index = page;
    searchFn();
  }

  onPageSizeChange(size: number, searchFn: () => void): void {
    if (size === this.state.paging.size) return;
    this.state.paging.size = size;
    this.resetToFirstPage();
    searchFn();
  }

  protected updatePagingState(pageMeta: Partial<PageMeta>): void {
    if (pageMeta.totalItems !== undefined || pageMeta.totalPages !== undefined) {
      // Cập nhật metadata phân trang vào state
      this.state.paging = {
        ...this.state.paging,
        totalItems: pageMeta.totalItems,
        totalPages: pageMeta.totalPages
      };
    }
  }

  // Method helper để lấy thông tin phân trang từ response
  protected extractPagingFromResponse<T>(response: any): { items: T[], pageMeta: Partial<PageMeta> } {
    const { items, totalItems, totalPages, ...rest } = response;
    return {
      items: items || [],
      pageMeta: { totalItems, totalPages }
    };
  }

  // Method helper để lấy thông tin phân trang hiện tại
  getPagingInfo(): { currentPage: number; pageSize: number; totalItems?: number; totalPages?: number } {
    return {
      currentPage: this.state.paging.index,
      pageSize: this.state.paging.size,
      totalItems: this.state.paging.totalItems,
      totalPages: this.state.paging.totalPages
    };
  }
}