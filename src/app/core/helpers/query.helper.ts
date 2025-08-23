import { ListState, Paging } from "../models/query.models";

export function createListState<F>(filter: F, paging: Paging = { index: 1, size: 10 }): ListState<F> {
  return { paging, filter };
}

export function patchFilter<F>(state: ListState<F>, patch: Partial<F>): ListState<F> {
  return {
    ...state,
    filter: { ...state.filter, ...patch },
    paging: { ...state.paging, index: 1 },
  };
}

export function setPage<F>(state: ListState<F>, index: number): ListState<F> {
  return { ...state, paging: { ...state.paging, index } };
}
export function setPageSize<F>(state: ListState<F>, size: number): ListState<F> {
  return { ...state, paging: { index: 1, size } };
}

export function toApi<F>(state: ListState<F>, extra: Record<string, any> = {}) {
  const { paging, filter } = state;
  return {
    pageIndex: paging.index,
    pageSize : paging.size,
    ...compact(filter as any),
    ...extra,
  };
}

export function applyMeta<F>(
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