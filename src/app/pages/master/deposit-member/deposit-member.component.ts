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
    { label: 'Thành viên lưu ký', active: true }
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
  modalRef?: BsModalRef;
  importForm: { file?: File; effectiveDate?: string } = {};
  uploading = false;
  importError?: string;
  effectiveDateDisplay?: string;
  stagedFileInfo?: StagedFileInfo | null;
  loadingStagedFile = false;
  effectiveDate?: Date | null;
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
        this.error = err?.error?.message || 'Không tải được dữ liệu';
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
    
    this.modalRef = this.modalService.show(this.importModal, { class: 'modal-lg' });
  }
  
  closeImportModal(): void { this.modalRef?.hide(); this.modalRef = undefined; }

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
    
    // File là bắt buộc
    if (!file) {
      this.importError = 'Vui lòng chọn file để upload';
      this.importForm.file = undefined;
      return;
    }
    
    // 1. Kiểm tra kỹ thuật file (file-level validation)
    const fileValidation = this.validateFile(file);
    if (!fileValidation.isValid) {
      this.importError = fileValidation.error;
      this.importForm.file = undefined;
      // Reset file input
      input.value = '';
      return;
    }
    
    // 2. Kiểm tra cấu trúc file (schema validation) - async
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
        this.toastService.error('Ngày hiệu lực phải từ ngày mai trở đi');
        this.effectiveDate = null;
        this.importForm.effectiveDate = undefined;
        this.effectiveDateDisplay = undefined;
        return;
      }
      
      const y = date.getFullYear();
      const m = ('0' + (date.getMonth() + 1)).slice(-2);
      const d = ('0' + date.getDate()).slice(-2);
      this.importForm.effectiveDate = `${y}-${m}-${d}`;
      this.effectiveDateDisplay = `${d}/${m}/${y}`;
    } else {
      this.importForm.effectiveDate = undefined;
      this.effectiveDateDisplay = undefined;
    }
  }
  
  submitImport(): void {
    if (!this.importForm.file || !this.importForm.effectiveDate) {
      this.importError = 'Vui lòng chọn tệp và ngày hiệu lực';
      return;
    }
    
    // Double-check date validation before submit
    if (this.effectiveDate) {
      const tomorrow = this.getTomorrow();
      tomorrow.setHours(0, 0, 0, 0);
      const selectedDate = new Date(this.effectiveDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        this.importError = 'Ngày hiệu lực phải từ ngày mai trở đi';
        return;
      }
    }
    
    // 4. Kiểm tra ràng buộc nghiệp vụ (business validation)
    this.validateBusinessRules();
    
    const form = new FormData();
    form.append('File', this.importForm.file);
    form.append('EffectiveDate', this.importForm.effectiveDate);
    
    this.uploading = true; this.importError = undefined;
    this.service.importDepositMembers(form).subscribe({
      next: () => {
        this.uploading = false; this.closeImportModal(); this.onSearch();
        this.toastService.success('Upload thành công!');
      },
      error: (err) => {
        this.uploading = false;
        // 5. Backend sẽ trả về business validation errors
        this.handleImportError(err);
      }
    });
  }
  
  // ==== Upload guideline extras ====
  onDownloadTemplate(): void {
    this.service.downloadImportTemplate().subscribe({
      next: (res: any) => { const blob = (res && res.body) ? (res.body as Blob) : (res as Blob); const cd = res?.headers?.get ? (res.headers.get("Content-Disposition") || res.headers.get("content-disposition")) : null; let filename = "deposit_member_template.xlsx"; if (cd) { const match = /filename\*=UTF-8'([^;]+)|filename=\"?([^;\"]+)\"?/i.exec(cd); const raw = decodeURIComponent((match && (match[1] || match[2])) || "").trim(); if (raw) filename = raw; } const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); },
      error: () => console.log('Không thể tải file mẫu', 'Lỗi')
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
  * 1. Kiểm tra kỹ thuật file (file-level validation)
  * - File bắt buộc phải được chọn
  * - Định dạng file (.xlsx, .csv, .xls)
  * - Dung lượng file (≤ 10MB)
  * - MIME type hợp lệ
  * - Encoding UTF-8 (cho CSV)
  */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Kiểm tra file có tồn tại không
    if (!file) {
      return {
        isValid: false,
        error: 'Vui lòng chọn file để upload'
      };
    }
    
    // Kiểm tra định dạng file - chỉ chấp nhận CSV
    const allowedExtensions = ['.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Định dạng file không hợp lệ. Chỉ chấp nhận: CSV`
      };
    }
    
    // Kiểm tra MIME type - chỉ chấp nhận CSV
    const allowedMimeTypes = [
      'text/csv', // .csv
      'application/csv', // .csv alternative
      'text/plain' // .csv alternative
    ];
    
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `MIME type không hợp lệ. File type: ${file.type || 'unknown'}. Chỉ chấp nhận CSV files.`
      };
    }
    
    // Kiểm tra dung lượng file (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File quá lớn. Dung lượng tối đa: ${this.getFileSize(maxSizeInBytes)}`
      };
    }
    
    // Kiểm tra file rỗng
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File không được rỗng'
      };
    }
    
    // Kiểm tra tên file không chứa ký tự đặc biệt nguy hiểm
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
      return {
        isValid: false,
        error: 'Tên file chứa ký tự không hợp lệ. Vui lòng đổi tên file.'
      };
    }
    
    return { isValid: true };
  }
  
  /**
  * 2. Kiểm tra cấu trúc CSV file (schema validation)
  * - Header đủ cột: DepositCode, ShortName, FullName
  * - Số dòng > 0
  */
  private validateFileStructure(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        // Chỉ xử lý CSV files
        if (fileExtension === '.csv') {
          this.validateCsvStructure(content);
        } else {
          // Không nên xảy ra vì đã validate ở validateFile()
          this.importError = 'Chỉ chấp nhận file CSV';
        }
      } catch (error) {
        this.importError = 'Không thể đọc file. Vui lòng kiểm tra lại file.';
      }
    };
    
    reader.onerror = () => {
      this.importError = 'Lỗi khi đọc file. Vui lòng thử lại.';
    };
    
    reader.readAsText(file, 'UTF-8');
  }
  
  /**
  * Validate CSV structure
  */
  private validateCsvStructure(content: string): void {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Kiểm tra có ít nhất header và 1 dòng dữ liệu
    if (lines.length < 2) {
      this.importError = 'File phải có ít nhất 1 dòng dữ liệu (ngoài header)';
      return;
    }
    
    // Kiểm tra header
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    const requiredHeaders = ['depositcode', 'shortname', 'fullname'];
    
    const missingHeaders = requiredHeaders.filter(req => 
      !header.some(h => h === req)
    );
    
    if (missingHeaders.length > 0) {
      this.importError = `Thiếu cột bắt buộc: ${missingHeaders.join(', ')}. Header phải có: ${requiredHeaders.join(', ')}`;
      return;
    }
    
    // Kiểm tra dữ liệu không toàn blank
    const dataLines = lines.slice(1);
    const hasData = dataLines.some(line => 
      line.split(',').some(cell => cell.trim() && cell.trim() !== '""')
    );
    
    if (!hasData) {
      this.importError = 'File không có dữ liệu hợp lệ. Tất cả dòng đều trống.';
      return;
    }
    
    // Kiểm tra ràng buộc dữ liệu cơ bản (row-level validation)
    this.validateCsvData(dataLines, header);
  }
  
  /**
  * 3. Kiểm tra ràng buộc dữ liệu cơ bản (row-level validation)
  * - Ô bắt buộc không null (DepositCode, FullName)
  * - Kiểu dữ liệu hợp lệ
  */
  private validateCsvData(dataLines: string[], header: string[]): void {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    dataLines.forEach((line, index) => {
      const rowNumber = index + 2; // +2 vì bắt đầu từ dòng 2 (sau header)
      const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      // Kiểm tra DepositCode không rỗng
      const depositCodeIndex = header.indexOf('depositcode');
      if (depositCodeIndex >= 0 && (!cells[depositCodeIndex] || cells[depositCodeIndex] === '')) {
        errors.push(`Dòng ${rowNumber}: DepositCode không được để trống`);
      }
      
      // Kiểm tra FullName không rỗng
      const fullNameIndex = header.indexOf('fullname');
      if (fullNameIndex >= 0 && (!cells[fullNameIndex] || cells[fullNameIndex] === '')) {
        errors.push(`Dòng ${rowNumber}: FullName không được để trống`);
      }
      
      // Cảnh báo: Tên viết hoa (warning)
      const shortNameIndex = header.indexOf('shortname');
      if (shortNameIndex >= 0 && cells[shortNameIndex]) {
        const shortName = cells[shortNameIndex];
        if (shortName !== shortName.toUpperCase()) {
          warnings.push(`Dòng ${rowNumber}: Tên viết tắt nên viết hoa: "${shortName}"`);
        }
        
        // Cảnh báo: Độ dài vượt ngưỡng
        if (shortName.length > 50) {
          warnings.push(`Dòng ${rowNumber}: Tên viết tắt quá dài (${shortName.length}/50 ký tự)`);
        }
      }
      
      // Cảnh báo: FullName quá dài
      if (fullNameIndex >= 0 && cells[fullNameIndex] && cells[fullNameIndex].length > 200) {
        warnings.push(`Dòng ${rowNumber}: Tên đầy đủ quá dài (${cells[fullNameIndex].length}/200 ký tự)`);
      }
    });
    
    // Hiển thị errors (chặn upload)
    if (errors.length > 0) {
      this.importError = `Lỗi dữ liệu:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ''}`;
      return;
    }
    
    // Hiển thị warnings (không chặn upload)
    if (warnings.length > 0) {
      const warningMsg = `Cảnh báo:\n${warnings.slice(0, 3).join('\n')}${warnings.length > 3 ? `\n... và ${warnings.length - 3} cảnh báo khác` : ''}`;
      console.warn(warningMsg);
      // Có thể hiển thị toast warning thay vì console
      this.toastService.info(`Có ${warnings.length} cảnh báo về dữ liệu. Kiểm tra console để xem chi tiết.`);
    }
    
    // Nếu không có lỗi, clear error message
    if (!this.importError) {
      this.importError = undefined;
    }
  }
  
  /**
  * 4. Kiểm tra ràng buộc nghiệp vụ (business validation) - sẽ được BE xử lý
  * - DepositCode không trùng DB
  * - EffectiveDate >= tomorrow
  */
  private validateBusinessRules(): void {
    // Business rules sẽ được validate ở backend
    // FE chỉ có thể validate những gì có sẵn locally
    
    if (this.importForm.effectiveDate) {
      const effectiveDate = new Date(this.importForm.effectiveDate);
      const tomorrow = this.getTomorrow();
      tomorrow.setHours(0, 0, 0, 0);
      
      if (effectiveDate < tomorrow) {
        this.toastService.info('Ngày hiệu lực phải từ ngày mai trở đi');
      }
    }
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
      const msg = this.errorMessageService.getErrorMessage(err) || 'Upload thất bại: Không thể lưu file lên hệ thống. Vui lòng thử lại hoặc liên hệ bộ phận vận hành.';
      this.importError = msg;
      // No toast notification - only display error in modal
    }
  }
  
  /**
  * Display detailed CSV validation errors
  */
  private displayDetailedErrors(errors: any[]): void {
    if (errors.length === 0) {
      this.importError = 'Có lỗi xảy ra khi xử lý file CSV.';
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
    errorMessage += '<h6 class="mb-2"><i class="bx bx-error-circle text-danger"></i> Lỗi validation CSV:</h6>';
    
    errorsByRow.forEach((rowErrors, rowNumber) => {
      errorMessage += `<div class="mb-2">`;
      errorMessage += `<strong>Dòng ${rowNumber}:</strong><ul class="mb-0">`;
      
      rowErrors.forEach(error => {
        const column = error.column || '';
        const message = error.message || 'Lỗi không xác định';
        errorMessage += `<li>${column ? `<strong>${column}:</strong> ` : ''}${message}</li>`;
      });
      
      errorMessage += `</ul></div>`;
    });
    
    errorMessage += '<div class="mt-2 text-muted small">';
    errorMessage += '<i class="bx bx-info-circle"></i> Vui lòng sửa các lỗi trên và thử lại.';
    errorMessage += '</div></div>';
    
    this.importError = errorMessage;
    // No toast notification - only display error in modal
  }
}
