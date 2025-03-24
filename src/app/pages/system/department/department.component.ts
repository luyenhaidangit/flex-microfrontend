import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/core/services/system.service';
import { STATUS_INFO } from './department.constant';

@Component({
  selector: 'app-bloglist',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {

  // Ui
  breadCrumbItems: Array<{}>;
  items: any = [];
  pagedInfo: any = {};

  DEFAULT_PER_PAGE_OPTIONS = [
    {
        label: 10,
        value: 10
    },
    {
        label: 25,
        value: 25
    },
    {
        label: 50,
        value: 50
    },
    {
        label: 100,
        value: 100
    }
  ];

  DEFAULT_STATUS_OPTIONS = [
    {
      label: 'Hoàn tất',
      value: ''
    },
    {
        label: 'Hoạt động',
        value: 'A'
    },
    {
        label: 'Chờ duyệt',
        value: 'P'
    }
  ]

  searchParams: any = {
    pageIndex: 1,
    pageSize: 10,
    name: '',
    status: ''
  }

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Quản trị hệ thống' }, { label: 'Quản lý phòng ban', active: true }];
    this.getItems({ ...this.searchParams });
  }

  // Data
  getItems(request: any){
    this.systemService.getDepartmentPaging(request).subscribe((result: any) => {
      console.log(result);
      if(result.isSuccess){
        const { items, ...pagedInfo } = result.data;
        this.items = items;
        this.pagedInfo = pagedInfo;
      }
    });
  }

  searchPaging(event: any){
    this.getItems(event);
  }

  getStatusText(status: number): string {
    return STATUS_INFO[status]?.text || 'Unknown';
  }

  getStatusClass(status: number): string {
    return STATUS_INFO[status]?.class || '';
  }
}
