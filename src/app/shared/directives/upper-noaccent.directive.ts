import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appUpperNoAccent]'
})
export class UpperNoAccentDirective {
  @Input() noSpace: boolean = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    let value = input.value;

    // Xóa dấu cách nếu noSpace được bật
    if (this.noSpace) {
      value = value.replace(/\s/g, '');
    }

    // Chuẩn hóa chuỗi và xóa dấu Tiếng Việt
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase();

    if (input.value !== normalized) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, normalized);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Ngăn chặn nhập dấu cách nếu noSpace được bật
    if (this.noSpace && event.key === ' ') {
      event.preventDefault();
    }
  }
}
