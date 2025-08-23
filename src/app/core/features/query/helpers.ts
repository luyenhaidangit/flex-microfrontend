import { ListState, Paging } from './types';

function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const r: any = {};
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k];
    if (v === null || v === undefined) return;
    if (typeof v === 'string' && v.trim() === '') return;
    r[k] = v;
  });
  return r;
}

function init<F>(filter: F, paging: Paging = { index: 1, size: 10 }): ListState<F> {
  return { paging, filter };
}

function updateFilter<F>(state: ListState<F>, patch: Partial<F>): ListState<F> {
  return { ...state, filter: { ...state.filter, ...patch }, paging: { ...state.paging, index: 1 } };
}

function withPage<F>(state: ListState<F>, index: number): ListState<F> {
  return { ...state, paging: { ...state.paging, index } };
}

function withPageSize<F>(state: ListState<F>, size: number): ListState<F> {
  return { ...state, paging: { index: 1, size } };
}

function buildQuery<F>(state: ListState<F>, extra: Record<string, any> = {}) {
  const { paging, filter } = state;
  return { pageIndex: paging.index, pageSize: paging.size, ...compact(filter as any), ...extra };
}

function syncPaging<F>(
  state: ListState<F>,
  meta?: Partial<{ pageIndex: number; pageSize: number }>
): ListState<F> {
  return {
    ...state,
    paging: {
      index: meta?.pageIndex ?? state.paging.index,
      size : meta?.pageSize  ?? state.paging.size,
    },
  };
}

export const Query = {
  init,
  updateFilter,
  withPage,
  withPageSize,
  buildQuery,
  syncPaging,
};
