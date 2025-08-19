export function getBranchTypeLabel(branchType: number | string | null | undefined): string {
  const type = branchType === null || branchType === undefined ? undefined : Number(branchType as any);
  switch (type) {
    case 1:
      return 'Chi nhánh chính';
    case 2:
      return 'Chi nhánh phụ';
    case 3:
      return 'Văn phòng đại diện';
    default:
      return 'Không xác định';
  }
}
