import { MatExpansionPanelDescription } from '@angular/material'

/**
 * Remove typographic accents or tildes in the given string.
 * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * @param text string that may contain accents/tildes
 */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Order an array of items based on an array of strings, by one of item's key.
 * Based on the code snippet: https://gist.github.com/ecarter/1423674#gistcomment-3065491
 */
export function mapOrder(items: any[], order: string[], key: string): any[] {
  return items.sort((a: any, b: any) => order.indexOf(a[key]) > order.indexOf(b[key]) ? 1 : -1)
}

/**
 * https://stackoverflow.com/a/35092754
 */
export function orderByKey(items: any[], key: string): any[] {
  return items.sort((a: any, b: any) => a[key].localeCompare(b[key]))

  // // sort by name
  // return array.sort((a: object, b: object) => {
  //   const nameA = a[key].toUpperCase() // ignore upper and lowercase
  //   const nameB = b[key].toUpperCase() // ignore upper and lowercase
  //   if (nameA < nameB) {
  //     return -1
  //   }
  //   if (nameA > nameB) {
  //     return 1
  //   }

  //   // names must be equal
  //   return 0
  // })
}

export function orderByStart(items: any[], key: string, substring: string): any[] {
  return items.sort((a: any, b: any) => a[key].startsWith(substring) > b[key].startsWith(substring) ? 1 : -1)
}
