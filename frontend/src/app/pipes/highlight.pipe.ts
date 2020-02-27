import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  specialCharacters = ['+', '-', '(', ')', '[', ']', '.', '*', '?', '$']

  transform(value: string, search: string): string {
    // escape special characters
    if (search) {
      this.specialCharacters.forEach(char => search = search.replace(char, `\\${char}`))
    }
    return value.replace(new RegExp(search, 'gi'), '<strong>$&</strong>')
  }

}
