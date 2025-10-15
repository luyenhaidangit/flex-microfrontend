export function mapSettleMethodLabel(code: string | null | undefined): string {
  const v = (code || '').toString().toUpperCase();
  switch (v) {
    case 'NET':
      return 'Bù trừ ròng (NET)';
    case 'TRAN':
      return 'Từng giao dịch';
    default:
      return v || '';
  }
}

export function mapYesNo(value: any): string {
  return value ? 'Có' : 'Không';
}

