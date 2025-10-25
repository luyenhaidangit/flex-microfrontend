import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appUpperNoAccent]'
})
export class UpperNoAccentDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    let value = input.value;

    // Chuẩn hóa chuỗi và xóa dấu Tiếng Việt
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase();

    if (value !== normalized) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, normalized);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
