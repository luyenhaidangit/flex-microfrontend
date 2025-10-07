import { Query, ListState, PageMeta } from 'src/app/core/features/query';
import { ENTITY_LIST_CONFIG } from './entity-list.config';
import { Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PaginationState } from '../pagination/pagination/pagination.component';
import { REQUEST_TYPE_OPTIONS } from 'src/app/core/constants/request-types.constant';

type ModalType = 'detail' | 'edit' | 'delete' | 'create' | 'approve' | 'reject';

export abstract class EntityListComponent<TFilter, TItem = any> {
  protected readonly config = ENTITY_LIST_CONFIG;

  // Properties
  activeTabId: string = this.config.tabs.default;
  loadingTable = false;
  items: TItem[] = [];
  selectedItem: TItem | null = null;
  state: ListState<TFilter>;
  
  // Default configuration
  tabsConfig: any = this.config.tabs;
  paginationConfig: any = this.config.pagination;
  filterConfig: any = this.config.filter;

  // Modal state management (compat shim via getters/setters)
  modalState: Record<ModalType, boolean> = {
    detail: false,
    edit: false,
    delete: false,
    create: false,
    approve: false,
    reject: false
  };
  get showDetailModal() { return this.modalState.detail; }
  set showDetailModal(v: boolean) { this.modalState.detail = v; }
  get showEditModal() { return this.modalState.edit; }
  set showEditModal(v: boolean) { this.modalState.edit = v; }
  get showDeleteModal() { return this.modalState.delete; }
  set showDeleteModal(v: boolean) { this.modalState.delete = v; }
  get showCreateModal() { return this.modalState.create; }
  set showCreateModal(v: boolean) { this.modalState.create = v; }
  get showApproveModal() { return this.modalState.approve; }
  set showApproveModal(v: boolean) { this.modalState.approve = v; }
  get showRejectModal() { return this.modalState.reject; }
  set showRejectModal(v: boolean) { this.modalState.reject = v; }

  // Destroy subject for cleanup
  protected destroy$ = new Subject<void>();

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

  // ---------- Generic data loading methods ----------
  
  /**
   * Generic method to load data with standard pattern
   * @param apiCall Observable API call
   * @param itemType Type of items (for type safety)
   */
  protected beforeLoad(): void {}
  protected afterLoad(): void {}
  protected onLoadError(error: any): void {}

  protected loadData<T = TItem>(apiCall: Observable<any>, itemType?: new() => T): void {
    this.beforeLoad();
    this.loadingTable = true;
    apiCall.pipe(
      finalize(() => { this.loadingTable = false; this.afterLoad(); }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          const { items, pageMeta } = this.extractPagingFromResponse<T>(res.data);
          this.items = (items as unknown as TItem[]) || [];
          this.updatePagingState(pageMeta);
        } else {
          this.items = [];
        }
      },
      error: (err) => {
        this.items = [];
        this.onLoadError(err);
      }
    });
  }

  /**
   * Get search parameters for API calls
   * Base implementation includes common pagination and status params
   * Child classes can override to add custom params or modify behavior
   */
  protected getSearchParams(): any {
    const baseParams = {
      pageIndex: this.state.paging.index,
      pageSize: this.state.paging.size,
      status: this.activeTabId
    };

    // Merge with filter properties and additional params
    return {
      ...baseParams,
      ...this.state.filter,
      ...this.getAdditionalSearchParams()
    };
  }

  /**
   * Get additional search parameters that child classes can override
   * This allows child classes to add custom params without overriding the entire method
   */
  protected getAdditionalSearchParams(): any {
    return {};
  }

  /**
   * Clean and return search parameters
   */
  protected getCleanSearchParams(): any {
    return this.cleanParams(this.getSearchParams());
  }

  // ---------- Internal method ----------
  resetToFirstPage(): void {
    this.state.paging.index = 1;
  }

  protected setPage(index: number): void {
    const total = this.state.paging.totalPages ?? 1;
    if (index < 1 || index > total || index === this.state.paging.index) return;
    this.state.paging.index = index;
    this.onSearch();
  }

  protected setPageSize(size: number): void {
    if (size && size > 0) {
      this.state.paging.size = size;
    }
    this.resetToFirstPage();
    this.onSearch();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.state.paging.totalPages || page === this.state.paging.index) return;
    this.state.paging.index = page;
    this.onSearch();
  }

  onPageSizeChange(pageSize?: number): void {
    if (pageSize !== undefined) {
      this.state.paging.size = pageSize;
    }
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

  // Method để lấy pagination state cho pagination component mới
  getPaginationState(): PaginationState {
    return {
      index: this.state.paging.index,
      size: this.state.paging.size,
      totalItems: this.state.paging.totalItems || 0,
      totalPages: this.state.paging.totalPages || 1
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
    // Reset all filter properties to their default values
    if (this.state?.filter) {
      Object.keys(this.state.filter).forEach(key => {
        const value = this.state.filter[key];
        if (typeof value === 'string') {
          this.state.filter[key] = '';
        } else if (typeof value === 'number') {
          this.state.filter[key] = null;
        } else if (typeof value === 'boolean') {
          this.state.filter[key] = false;
        } else {
          this.state.filter[key] = null;
        }
      });
    }
  }

  // ---------- Modal management methods ----------
  
  /**
   * Generic method to open detail modal
   * Child classes can override to add custom logic
   */
  protected openDetailModal(item: TItem): void {
    this.selectedItem = item;
    this.showDetailModal = true;
  }

  /**
   * Generic method to open edit modal
   * Child classes can override to add custom logic
   */
  protected openEditModal(item: TItem): void {
    this.selectedItem = item;
    this.showEditModal = true;
  }

  /**
   * Generic method to open delete modal
   * Child classes can override to add custom logic
   */
  protected openDeleteModal(item: TItem): void {
    this.selectedItem = item;
    this.showDeleteModal = true;
  }

  /**
   * Generic method to open create modal
   * Child classes can override to add custom logic
   */
  protected openCreateModal(): void {
    this.selectedItem = null;
    this.showCreateModal = true;
  }

  protected openStateModal(type: ModalType, item?: TItem): void {
    this.closeAllModals();
    this.selectedItem = item ?? null;
    this.modalState[type] = true;
  }

  protected closeStateModal(type: ModalType): void {
    this.modalState[type] = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close all modals
   */
  protected closeAllModals(): void {
    this.showDetailModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showCreateModal = false;
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close detail modal
   */
  protected onDetailModalClose(): void {
    this.showDetailModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close edit modal
   */
  protected onEditModalClose(): void {
    this.showEditModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close delete modal
   */
  protected onDeleteModalClose(): void {
    this.showDeleteModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close create modal
   */
  protected onCreateModalClose(): void {
    this.showCreateModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to open approve modal
   */
  protected openApproveModal(item: TItem): void {
    this.selectedItem = item;
    this.showApproveModal = true;
  }

  /**
   * Generic method to open reject modal
   */
  protected openRejectModal(item: TItem): void {
    this.selectedItem = item;
    this.showRejectModal = true;
  }

  /**
   * Generic method to close approve modal
   */
  protected onApproveModalClose(): void {
    this.showApproveModal = false;
    this.selectedItem = null;
  }

  /**
   * Generic method to close reject modal
   */
  protected onRejectModalClose(): void {
    this.showRejectModal = false;
    this.selectedItem = null;
  }

  // ---------- Lifecycle methods ----------
  
  /**
   * Cleanup method - call this in ngOnDestroy of child components
   */
  protected cleanup(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeAllModals();
  }
}
