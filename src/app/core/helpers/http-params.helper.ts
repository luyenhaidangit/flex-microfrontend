export function buildSearchParams(state: any, fields: string[]): any {
  const params: any = {};
  for (const field of fields) {
    const value = state[field];
    if (value !== null && value !== undefined && value !== '') {
      params[field] = value;
    }
  }
  return params;
}
