import { Query, ListState } from 'src/app/core/features/query';

export abstract class EntityListComponent<TFilter> {
  state: ListState<TFilter>;

  protected constructor(initFilter: TFilter) {
    this.state = Query.init(initFilter, { index: 1, size: 10 });
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
}