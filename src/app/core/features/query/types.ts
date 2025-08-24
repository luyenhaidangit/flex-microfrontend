export interface Paging { 
  index: number; 
  size: number;
  totalItems?: number;  // Thêm optional fields cho metadata phân trang
  totalPages?: number;
}

export interface PageMeta { 
  totalItems: number; 
  totalPages: number 
}

export interface ListState<F> { 
  paging: Paging; 
  filter: F 
}
