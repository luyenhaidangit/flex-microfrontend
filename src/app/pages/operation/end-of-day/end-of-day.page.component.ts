import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-end-of-day-page',
  templateUrl: './end-of-day.component.html',
  styleUrls: ['./end-of-day.component.scss']
})
export class EndOfDayPageComponent {
  breadCrumbItems = [
    { label: 'Vận hành' },
    { label: 'Xử lý cuối ngày', active: true }
  ];

  processing = false;
  processingBatch = false;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  runEod() {
    this.processing = true;
    setTimeout(() => this.processing = false, 1500);
  }

  runBatchDepositMembers(): void {
    if (this.processingBatch) return;
    this.processingBatch = true;
    this.http.post('/api/batch/deposit-members', {})
      .subscribe({
        next: () => {
          this.toastr.success('Xử lý batch thành công');
          this.processingBatch = false;
        },
        error: (err) => {
          const msg = err?.error?.message || 'Xử lý batch thất bại';
          this.toastr.error(msg);
          this.processingBatch = false;
        }
      });
  }
}