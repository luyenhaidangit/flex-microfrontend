import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appUpperNoSpace]'
})
export class UpperNoSpaceDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    const value = input.value.toUpperCase().replace(/\s+/g, '');
    if (input.value !== value) {
      input.value = value;
      // Đảm bảo cập nhật cho formControl nếu có
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
} 