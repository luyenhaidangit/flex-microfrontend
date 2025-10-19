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

  /**
   * Đóng tất cả modal đang mở trong ứng dụng
   * Sử dụng khi token hết hạn hoặc cần force close tất cả modal
   */
  closeAllModals(): void {
    try {
      while (this.bsModalService.getModalsCount() > 0) {
        this.bsModalService.hide();
      }

      // Fallback cleanup for any stray Bootstrap backdrops or custom modals
      if (typeof document !== 'undefined') {
        // Remove bootstrap backdrops
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        // Remove body lock class
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        // Hide any custom modal elements using .modal.show or .d-block
        document.querySelectorAll('.modal.show, .modal.d-block').forEach((el: Element) => {
          (el as HTMLElement).classList.remove('show', 'd-block');
          (el as HTMLElement).setAttribute('aria-hidden', 'true');
          (el as HTMLElement).setAttribute('style', 'display:none');
        });
      }
    } catch (error) {
      console.warn('Error closing modals:', error);
    }
  }
}
