// https://stackblitz.com/edit/angular-nue8pb

import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'bold'
})
export class BoldPipe implements PipeTransform {

  transform(text: string, search): string {
    const pattern = search
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
      .split(' ')
      .filter(t => t.length > 0)
      .join('|')
    const regex = new RegExp(pattern, 'gi')

    return search ? text.replace(regex, match => `<b style="color: #673ab7">${match}</b>`) : text
    // return search ? text.replace(regex, match => `<b>${match}</b>`) : text
  }
}
