import { Component } from '@angular/core';

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

  runEod() {
    this.processing = true;
    setTimeout(() => this.processing = false, 1500);
  }
}

