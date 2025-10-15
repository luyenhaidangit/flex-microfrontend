import { Component , OnInit} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Injector } from '@angular/core';
import { ModalService } from './core/services/modal.service';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.setPageTitle();
    // Always close any open modals on route changes (e.g., redirect to login)
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) {
        this.modalService.closeAllModals();
      }
    });
  }

  private setPageTitle() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child && child.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data['title'] || 'Flex - Phần mềm quản lý và giao dịch chứng khoán';
      })
    ).subscribe((title: string) => {
      this.titleService.setTitle(title);
    });
  }
}
