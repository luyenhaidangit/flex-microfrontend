import { Component, OnInit } from '@angular/core';
import { ErrorPageService } from 'src/app/core/services/error-page.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './errorpage.component.html',
  styleUrls: ['./errorpage.component.scss']
})

/**
 * Pages-500 component
 */
export class ErrorPageComponent implements OnInit {

  constructor(public errorPageService: ErrorPageService) {}

  ngOnInit(): void {
  }
}
