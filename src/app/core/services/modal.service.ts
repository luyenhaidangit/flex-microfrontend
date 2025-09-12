import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: BsModalService) {}

  /**
   * Đóng tất cả modal đang mở trong ứng dụng
   * Sử dụng khi token hết hạn hoặc cần force close tất cả modal
   */
  closeAllModals(): void {
    try {
      while (this.modalService.getModalsCount() > 0) {
        this.modalService.hide();
      }
    } catch (error) {
      console.warn('Error closing modals:', error);
    }
  }
}
