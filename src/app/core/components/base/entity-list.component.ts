import { Query, ListState, PageMeta } from 'src/app/core/features/query';
import { ENTITY_LIST_CONFIG } from './entity-list.config';

export abstract class EntityListComponent<TFilter> {
  protected readonly config = ENTITY_LIST_CONFIG;

  // Properties
  activeTabId: string = this.config.tabs.default;
  loadingTable = false;
  state: ListState<TFilter>;
  
  // Default configuration
  tabsConfig: any = this.config.tabs;
  paginationConfig: any = this.config.pagination;

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

  // Hande action paging
  // ---------- Required method ----------
  protected constructor(initFilter: TFilter) {
    this.state = Query.init(initFilter, { index: 1, size: 10 });
  }

  protected abstract onSearch(): void;

  // ---------- Internal method ----------
  resetToFirstPage(): void {
    this.state.paging.index = 1;
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.state.paging.totalPages || page === this.state.paging.index) return;
    this.state.paging.index = page;
    this.onSearch();
  }

  onPageSizeChange(): void {
    this.resetToFirstPage();
    this.onSearch();
  }

  updatePagingState(pageMeta: Partial<PageMeta>): void {
    if (pageMeta.totalItems !== undefined || pageMeta.totalPages !== undefined) {
      this.state.paging = {
        ...this.state.paging,
        totalItems: pageMeta.totalItems,
        totalPages: pageMeta.totalPages
      };
    }
  }

  // ---------- Internal method ----------

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

  // Tab change
  onTabChange(tabId: string): void {
		this.activeTabId = tabId;
		this.resetSearchParams();
    this.resetToFirstPage();
		this.onSearch();
	}

  protected resetSearchParams(): void {
	}
}