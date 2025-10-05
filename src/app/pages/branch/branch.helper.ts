export function getBranchTypeLabel(branchType: number | string | null | undefined): string {
  const type = branchType === null || branchType === undefined ? undefined : Number(branchType as any);
  switch (type) {
    case 1:
      return 'Hội sở chính';
    case 2:
      return 'Chi nhánh';
    case 3:
      return 'Văn phòng giao dịch';
    default:
      return 'Không xác định';
  }
}
