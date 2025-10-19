import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DepositMemberItem, DepositMemberSearchParams, StagedFileInfo } from './deposit-member.models';
import { DepositMemberService } from './deposit-member.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale, viLocale } from 'ngx-bootstrap/chronos';
import { ToastService } from 'angular-toastify';
import { ErrorMessageService } from '../../../core/services/error-message.service';

@Component({
  selector: 'app-deposit-member-list',
  templateUrl: './deposit-member.component.html',
  styleUrls: ['./deposit-member.component.scss']
})
export class DepositMemberComponent implements OnInit {
  // Breadcrumb
  breadCrumbItems = [
    { label: 'Danh mục cơ sở' },
    { label: 'Thành viên luu ký', active: true }
  ];
  
  // UI state
  loading = false;
  items: DepositMemberItem[] = [];
  error?: string;
  
  // Filters
  filter = {
    depositCode: '',
    shortName: '',
    fullName: '',
    bicCode: ''
  };
  
  // Pagination state (compatible with app-pagination)
  paging = {
    index: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0
  };
  
  // Sorting state
  sort: { column: 'depositCode' | 'shortName' | 'fullName' | 'bicCode' | null; direction: 'asc' | 'desc' | null } = {
    column: null,
    direction: null
  };
  
  // Table skeleton
  skeleton = {
    rows: 8,
    columns: ['140px', '200px', '320px', '160px']
  };
  
  // Import & Preview state
  @ViewChild('importModal') importModal!: TemplateRef<any>;
  @ViewChild('approveModal') approveModal!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectModal!: TemplateRef<any>;
  modalRef?: BsModalRef;
  approveModalRef?: BsModalRef;
  rejectModalRef?: BsModalRef;
  approveLoading = false;
  importForm: { file?: File; effectiveDate?: string } = {};
  uploading = false;
  importError?: string;
  stagedFileInfo?: StagedFileInfo | null;
  loadingStagedFile = false;
  effectiveDate?: Date | null;
  rejectReason: string = '';
  bsConfig: Partial<BsDatepickerConfig> = { 
    dateInputFormat: 'DD/MM/YYYY',
    minDate: this.getTomorrow(),
    showWeekNumbers: false
  };
  
  constructor(
    private service: DepositMemberService, 
    private modalService: BsModalService, 
    private toastService: ToastService,
    private bsLocaleService: BsLocaleService,
    private errorMessageService: ErrorMessageService
  ) {
    // Define and set Vietnamese locale for datepicker
    defineLocale('vi', viLocale);
    this.bsLocaleService.use('vi');
  }
  
  ngOnInit(): void { this.load(); }
  
  getPaginationState() { return { ...this.paging }; }
  
  onPageChange(page: number): void {
    if (page < 1 || (this.paging.totalPages && page > this.paging.totalPages) || page === this.paging.index) return;
    this.paging.index = page;
    this.load();
  }
  
  onPageSizeChange(size: number): void {
    if (size === this.paging.size) return;
    this.paging.size = size;
    this.paging.index = 1;
    this.load();
  }
  
  onSearch(): void { this.paging.index = 1; this.load(); }
  
  onSort(column: 'depositCode' | 'shortName' | 'fullName' | 'bicCode'): void {
    if (this.sort.column === column) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : (this.sort.direction === 'desc' ? null : 'asc');
      if (!this.sort.direction) this.sort.column = null;
    } else {
      this.sort.column = column; this.sort.direction = 'asc';
    }
    this.paging.index = 1; this.load();
  }
  
  private load(): void {
    const params: DepositMemberSearchParams = {
      pageIndex: this.paging.index,
      pageSize: this.paging.size,
      depositCode: this.filter.depositCode?.trim() || undefined,
      shortName: this.filter.shortName?.trim() || undefined,
      fullName: this.filter.fullName?.trim() || undefined,
      bicCode: this.filter.bicCode?.trim() || undefined,
      sortColumn: this.sort.column || undefined,
      sortDirection: this.sort.direction || undefined,
    };
    
    this.loading = true; this.error = undefined;
    this.service.getPaging(params).subscribe({
      next: (res) => {
        const page = res?.data || (undefined as any);
        this.items = page?.items ?? [];
        this.paging.totalItems = page?.totalItems ?? 0;
        this.paging.totalPages = page?.totalPages ?? 0;
        this.loading = false;
      },
      error: (err) => {
        this.items = []; this.paging.totalItems = 0; this.paging.totalPages = 0;
        this.error = err?.error?.message || 'Không t?i du?c d? li?u';
        this.loading = false;
      }
    });
  }
  
  // ==== Import handling ====
  openImportModal(): void {
    this.importForm = {}; this.importError = undefined; this.uploading = false;
    // Set default effective date to tomorrow
    this.effectiveDate = this.getTomorrow();
    this.onEffectiveDateChange(this.effectiveDate);
    
    // Load staged file info
    this.loadStagedFileInfo();
    
    this.modalRef = this.modalService.show(this.importModal, { class: 'modal-xl' });
  }
  
  closeImportModal(): void { this.modalRef?.hide(); this.modalRef = undefined; }

  // Approve/Reject confirmation modals
  openApproveModal(): void {
    this.closeImportModal();
    setTimeout(() => {
      this.approveModalRef = this.modalService.show(this.approveModal, {
        class: 'modal-xl',
        backdrop: 'static',
        keyboard: false
      });
    }, 500);
  }

  closeApproveModal(): void {
    this.approveModalRef?.hide();
    this.approveModalRef = undefined;
  }

  openRejectModal(): void {
    this.rejectReason = '';
    this.closeImportModal();
    setTimeout(() => {
      this.rejectModalRef = this.modalService.show(this.rejectModal, {
        class: 'modal-xl',
        backdrop: 'static',
        keyboard: false
      });
    }, 500);
  }

  closeRejectModal(): void {
    this.rejectModalRef?.hide();
    this.rejectModalRef = undefined;
  }

  loadStagedFileInfo(): void {
    this.loadingStagedFile = true;
    this.stagedFileInfo = null;
    
    this.service.getStagedFile().subscribe({
      next: (stagedFile) => {
        this.loadingStagedFile = false;
        this.stagedFileInfo = stagedFile;
      },
      error: (err) => {
        this.loadingStagedFile = false;
        this.stagedFileInfo = null;
        console.error('Error loading staged file:', err);
      }
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : undefined;
    
    // File must be selected
    if (!file) {
      this.importError = 'Vui lòng chọn file upload';
      this.importForm.file = undefined;
      return;
    }
    
    // Validate file
    const fileValidation = this.validateFile(file);
    if (!fileValidation.isValid) {
      this.importError = fileValidation.error;
      this.importForm.file = undefined;
      // Reset file input
      input.value = '';
      return;
    }
    
    // 2. Ki?m tra c?u trúc file (schema validation) - async
    this.validateFileStructure(file);
    
    this.importForm.file = file;
    this.importError = undefined;
  }
  
  onEffectiveDateChange(date: Date | null): void {
    if (date) {
      // Validate that selected date is not before tomorrow
      const tomorrow = this.getTomorrow();
      tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        this.toastService.error('Ngày hi?u l?c ph?i t? ngày mai tr? di');
        this.effectiveDate = null;
        this.importForm.effectiveDate = undefined;
        return;
      }
      
      const y = date.getFullYear();
      const m = ('0' + (date.getMonth() + 1)).slice(-2);
      const d = ('0' + date.getDate()).slice(-2);
      this.importForm.effectiveDate = `${y}-${m}-${d}`;
    } else {
      this.importForm.effectiveDate = undefined;
    }
  }
  
  submitImport(): void {
    if (!this.importForm.file || !this.importForm.effectiveDate) {
      this.importError = 'Vui lòng ch?n t?p và ngày hi?u l?c';
      return;
    }
    
    // Double-check date validation before submit
    if (this.effectiveDate) {
      const tomorrow = this.getTomorrow();
      tomorrow.setHours(0, 0, 0, 0);
      const selectedDate = new Date(this.effectiveDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        this.importError = 'Ngày hi?u l?c ph?i t? ngày mai tr? di';
        return;
      }
    }
    
    // 4. Ki?m tra ràng bu?c nghi?p v? (business validation)
    this.validateBusinessRules();
    
    const form = new FormData();
    form.append('File', this.importForm.file);
    form.append('EffectiveDate', this.importForm.effectiveDate);
    
    this.uploading = true; this.importError = undefined;
    this.service.createImportRequest(form).subscribe({
      next: () => {
        this.uploading = false; this.closeImportModal(); this.onSearch();
        this.toastService.success('Upload thành công!');
      },
      error: (err) => {
        this.uploading = false;
        // 5. Backend s? tr? v? business validation errors
        this.handleImportError(err);
      }
    });
  }
  
  // ==== Upload guideline extras ====
  onDownloadTemplate(): void {
    this.service.downloadImportTemplate().subscribe({
      next: (res: any) => { const blob = (res && res.body) ? (res.body as Blob) : (res as Blob); const cd = res?.headers?.get ? (res.headers.get("Content-Disposition") || res.headers.get("content-disposition")) : null; let filename = "deposit_member_template.xlsx"; if (cd) { const match = /filename\*=UTF-8'([^;]+)|filename=\"?([^;\"]+)\"?/i.exec(cd); const raw = decodeURIComponent((match && (match[1] || match[2])) || "").trim(); if (raw) filename = raw; } const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); },
      error: () => console.log('Không th? t?i file m?u', 'L?i')
    });
  }
  
  
  // Helper method to format file size
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // ===== VALIDATION METHODS =====
  
  /**
  * 1. Ki?m tra k? thu?t file (file-level validation)
  * - File b?t bu?c ph?i du?c ch?n
  * - Ð?nh d?ng file (.xlsx, .csv, .xls)
  * - Dung lu?ng file (= 10MB)
  * - MIME type h?p l?
  * - Encoding UTF-8 (cho CSV)
  */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Ki?m tra file có t?n t?i không
    if (!file) {
      return {
        isValid: false,
        error: 'Vui lòng ch?n file d? upload'
      };
    }
    
    // Ki?m tra d?nh d?ng file - ch? ch?p nh?n CSV
    const allowedExtensions = ['.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Ð?nh d?ng file không h?p l?. Ch? ch?p nh?n: CSV`
      };
    }
    
    // Ki?m tra MIME type - ch? ch?p nh?n CSV
    const allowedMimeTypes = [
      'text/csv', // .csv
      'application/csv', // .csv alternative
      'text/plain' // .csv alternative
    ];
    
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `MIME type khÃ´ng há»£p lá»‡. File type: ${file.type || 'unknown'}. Chá»‰ cháº¥p nháº­n CSV files.`
      };
    }
    
    // Ki?m tra dung lu?ng file (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File quÃ¡ lá»›n. Dung lÆ°á»£ng tá»‘i Ä‘a: ${this.getFileSize(maxSizeInBytes)}`
      };
    }
    
    // Kiá»ƒm tra file rá»—ng
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File khÃ´ng Ä‘Æ°á»£c rá»—ng'
      };
    }
    
    // Kiá»ƒm tra tÃªn file khÃ´ng chá»©a kÃ½ tá»± Ä‘áº·c biá»‡t nguy hiá»ƒm
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
      return {
        isValid: false,
        error: 'TÃªn file chá»©a kÃ½ tá»± khÃ´ng há»£p lá»‡. Vui lÃ²ng Ä‘á»•i tÃªn file.'
      };
    }
    
    return { isValid: true };
  }
  
  /**
  * 2. Kiá»ƒm tra cáº¥u trÃºc CSV file (schema validation)
  * - Header Ä‘á»§ cá»™t: DepositCode, ShortName, FullName
  * - Sá»‘ dÃ²ng > 0
  */
  private validateFileStructure(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        // Chá»‰ xá»­ lÃ½ CSV files
        if (fileExtension === '.csv') {
          this.validateCsvStructure(content);
        } else {
          // KhÃ´ng nÃªn xáº£y ra vÃ¬ Ä‘Ã£ validate á»Ÿ validateFile()
          this.importError = 'Chá»‰ cháº¥p nháº­n file CSV';
        }
      } catch (error) {
        this.importError = 'KhÃ´ng thá»ƒ Ä‘á»c file. Vui lÃ²ng kiá»ƒm tra láº¡i file.';
      }
    };
    
    reader.onerror = () => {
      this.importError = 'Lá»—i khi Ä‘á»c file. Vui lÃ²ng thá»­ láº¡i.';
    };
    
    reader.readAsText(file, 'UTF-8');
  }
  
  /**
  * Validate CSV structure
  */
    /**
  * Validate CSV structure
  */
  private validateCsvStructure(content: string): void {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      this.importError = 'File phải có ít nhất 1 dòng dữ liệu (ngoài header)';
      return;
    }
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/\"/g, ''));
    const requiredHeaders = ['depositcode', 'shortname', 'fullname'];
    const missingHeaders = requiredHeaders.filter(req => !header.some(h => h === req));
    if (missingHeaders.length > 0) {
      this.importError = `Thiếu cột bắt buộc: ${missingHeaders.join(', ')}. Header phải có: ${requiredHeaders.join(', ')}`;
      return;
    }
    const dataLines = lines.slice(1);
    const hasData = dataLines.some(line => line.split(',').some(cell => cell.trim() && cell.trim() !== '""'));
    if (!hasData) {
      this.importError = 'File không có dữ liệu hợp lệ. Tất cả dòng đều trống.';
      return;
    }
    this.validateCsvData(dataLines, header);
  }

  /**
  * 3. Row-level validation
  */
  private validateCsvData(dataLines: string[], header: string[]): void {
    const errors: string[] = [];
    const warnings: string[] = [];
    dataLines.forEach((line, index) => {
      const rowNumber = index + 2;
      const cells = line.split(',').map(cell => cell.trim().replace(/\"/g, ''));
      const depositCodeIndex = header.indexOf('depositcode');
      if (depositCodeIndex >= 0 && (!cells[depositCodeIndex] || cells[depositCodeIndex] === '')) {
        errors.push(`Dòng ${rowNumber}: DepositCode không được để trống`);
      }
      const fullNameIndex = header.indexOf('fullname');
      if (fullNameIndex >= 0 && (!cells[fullNameIndex] || cells[fullNameIndex] === '')) {
        errors.push(`Dòng ${rowNumber}: FullName không được để trống`);
      }
      const shortNameIndex = header.indexOf('shortname');
      if (shortNameIndex >= 0 && cells[shortNameIndex]) {
        const shortName = cells[shortNameIndex];
        if (shortName !== shortName.toUpperCase()) {
          warnings.push(`Dòng ${rowNumber}: Tên viết tắt nên viết hoa: "${shortName}"`);
        }
        if (shortName.length > 50) {
          warnings.push(`Dòng ${rowNumber}: Tên viết tắt quá dài (${shortName.length}/50 ký tự)`);
        }
      }
      if (fullNameIndex >= 0 && cells[fullNameIndex] && cells[fullNameIndex].length > 200) {
        warnings.push(`Dòng ${rowNumber}: Tên đầy đủ quá dài (${cells[fullNameIndex].length}/200 ký tự)`);
      }
    });
    if (errors.length > 0) {
      this.importError = `Lỗi dữ liệu:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ''}`;
      return;
    }
    if (warnings.length > 0) {
      const warningMsg = `Cảnh báo:\n${warnings.slice(0, 3).join('\n')}${warnings.length > 3 ? `\n... và ${warnings.length - 3} cảnh báo khác` : ''}`;
      console.warn(warningMsg);
      this.toastService.info(`Có ${warnings.length} cảnh báo về dữ liệu. Kiểm tra console để xem chi tiết.`);
    }
    if (!this.importError) {
      this.importError = undefined;
    }
  }

  private validateBusinessRules(): void {
    // Business rules sáº½ Ä‘Æ°á»£c validate á»Ÿ backend
    // FE chá»‰ cÃ³ thá»ƒ validate nhá»¯ng gÃ¬ cÃ³ sáºµn locally
    
    if (this.importForm.effectiveDate) {
      const effectiveDate = new Date(this.importForm.effectiveDate);
      const tomorrow = this.getTomorrow();
      tomorrow.setHours(0, 0, 0, 0);
      
      if (effectiveDate < tomorrow) {
        this.toastService.info('NgÃ y hiá»‡u lá»±c pháº£i tá»« ngÃ y mai trá»Ÿ Ä‘i');
      }
    }
  }
  
  // Confirm reject from modal using entered reason
  confirmReject(): void {
    if (!this.stagedFileInfo?.isRequest) return;
    const reason = (this.rejectReason || '').trim();
    this.service.rejectRequest(this.stagedFileInfo.requestId, reason).subscribe({
      next: () => {
        this.toastService.success('Từ chối yêu cầu thành công');
        this.closeRejectModal();
        this.loadStagedFileInfo();
      },
      error: (err) => this.toastService.error(this.errorMessageService.getErrorMessage(err) || 'T��� ch��`i yA�u c��\u0015u th���t b���i')
    });
  }

  // Approve with loading state from modal
  approveConfirm(): void {
    if (!this.stagedFileInfo?.isRequest || this.approveLoading) return;
    this.approveLoading = true;
    this.service.approveRequest(this.stagedFileInfo.requestId).subscribe({
      next: () => {
        this.toastService.success('Duyệt yêu cầu thành công');
        this.approveLoading = false;
        this.closeApproveModal();
        this.loadStagedFileInfo();
      },
      error: (err) => {
        this.approveLoading = false;
        this.toastService.error(this.errorMessageService.getErrorMessage(err) || 'Duyệt yêu cầu thất bại');
      }
    });
  }

  /**
  * Get tomorrow's date
  */
  private getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  /**
  * Handle import errors with detailed error display
  */
  private handleImportError(err: any): void {
    const errorResponse = err?.error;
    
    if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
      // CSV validation errors - display detailed errors
      this.displayDetailedErrors(errorResponse.errors);
    } else {
      // General error - use ErrorMessageService for error mapping
      const msg = this.errorMessageService.getErrorMessage(err) || 'Upload tháº¥t báº¡i: KhÃ´ng thá»ƒ lÆ°u file lÃªn há»‡ thá»‘ng. Vui lÃ²ng thá»­ láº¡i hoáº·c liÃªn há»‡ bá»™ pháº­n váº­n hÃ nh.';
      this.importError = msg;
      // No toast notification - only display error in modal
    }
  }
  
  /**
  * Display detailed CSV validation errors
  */
  private displayDetailedErrors(errors: any[]): void {
    if (errors.length === 0) {
      this.importError = 'CÃ³ lá»—i xáº£y ra khi xá»­ lÃ½ file CSV.';
      return;
    }
    
    // Group errors by row for better display
    const errorsByRow = new Map<number, any[]>();
    errors.forEach(error => {
      const row = error.row || 0;
      if (!errorsByRow.has(row)) {
        errorsByRow.set(row, []);
      }
      errorsByRow.get(row)!.push(error);
    });
    
    // Build detailed error message
    let errorMessage = '<div class="csv-validation-errors">';
    errorMessage += '<h6 class="mb-2"><i class="bx bx-error-circle text-danger"></i> Lá»—i validation CSV:</h6>';
    
    errorsByRow.forEach((rowErrors, rowNumber) => {
      errorMessage += `<div class="mb-2">`;
      errorMessage += `<strong>DÃ²ng ${rowNumber}:</strong><ul class="mb-0">`;
      
      rowErrors.forEach(error => {
        const column = error.column || '';
        const message = error.message || 'Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh';
        errorMessage += `<li>${column ? `<strong>${column}:</strong> ` : ''}${message}</li>`;
      });
      
      errorMessage += `</ul></div>`;
    });
    
    errorMessage += '<div class="mt-2 text-muted small">';
    errorMessage += '<i class="bx bx-info-circle"></i> Vui lÃ²ng sá»­a cÃ¡c lá»—i trÃªn vÃ  thá»­ láº¡i.';
    errorMessage += '</div></div>';
    
    this.importError = errorMessage;
    // No toast notification - only display error in modal
  }
}
