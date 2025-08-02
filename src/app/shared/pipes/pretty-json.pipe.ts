import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyJson'
})
export class PrettyJsonPipe implements PipeTransform {

  transform(value: any, options?: { limit?: number, colorize?: boolean }): string {
    if (!value) return '';

    try {
      // Nếu là string, parse sang object
      const jsonObj = typeof value === 'string' ? JSON.parse(value) : value;
      let pretty = JSON.stringify(jsonObj, null, 2);

      // Giới hạn ký tự (truncate)
      if (options?.limit && pretty.length > options.limit) {
        pretty = pretty.substring(0, options.limit) + '...';
      }

      // Nếu cần highlight màu (khi show ở modal với [innerHTML])
      if (options?.colorize) {
        pretty = this.syntaxHighlight(pretty);
      }

      return pretty;
    } catch {
      // Nếu không parse được, trả lại nguyên bản
      return options?.limit && value.length > options.limit ? value.substring(0, options.limit) + '...' : value;
    }
  }

  private syntaxHighlight(json: string): string {
    if (!json) return '';
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'key' : 'string';
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }
} 