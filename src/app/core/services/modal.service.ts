import { Injectable } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private modals: BsModalRef[] = [];

  constructor(private bsModalService: BsModalService) {}

  open<T>(component: any, initialState?: object): BsModalRef {
    const ref = this.bsModalService.show(component, { initialState });
    this.modals.push(ref);

    // Xóa modal khỏi danh sách khi đóng
    ref.onHidden?.subscribe(() => {
      this.modals = this.modals.filter(m => m !== ref);
    });

    return ref;
  }

  closeAll(): void {
    this.modals.forEach(m => m.hide());
    this.modals = [];
  }
}
