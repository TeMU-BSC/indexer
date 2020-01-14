/**
 * Remove typographic accents or tildes in the given string.
 * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
 * @param text string that may contain accents/tildes
 */
export function _normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Order some items based on an order array (of strings), regarding a key of each item.
 * https://gist.github.com/ecarter/1423674#gistcomment-3065491
 */
export function _sortByArray(items: any[], order: string[], key: string): any[] {
  return items.sort((a, b) => order.indexOf(a[key]) < order.indexOf(b[key]) ? -1 : 1)
}

/**
 * Sort the given items array of objects that match a given input by a given property (key):
 * 1. First: Items with starting match of their key, then sort them by that key.
 * 2. Second: Items without starting match and with a match at any place of their key, then sort them by that key.
 * 3. Third: Items without matches of their key.
 */
export function _sort(items: any[], input: string, key: string) {
  const start = items.filter(item => item[key].startsWith(input)).sort((a, b) => a[key].localeCompare(b[key]))
  const inner = items.filter(item => !item[key].startsWith(input) && item[key].includes(input)).sort((a, b) => a[key].localeCompare(b[key]))
  const others = items.filter(item => !item[key].includes(input)).sort((a, b) => a[key].localeCompare(b[key]))
  return start.concat(inner).concat(others)
}