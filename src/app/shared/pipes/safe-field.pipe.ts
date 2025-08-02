import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeField' })
export class SafeFieldPipe implements PipeTransform {
  transform(value: any, fallback: string = '—'): any {
    return value ?? fallback;
  }
}