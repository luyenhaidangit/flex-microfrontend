export interface Paging { 
  index: number; 
  size: number 
}

export interface PageMeta { 
  totalItems: number; 
  totalPages: number 
}

export interface ListState<F> { 
  paging: Paging; 
  filter: F 
}
