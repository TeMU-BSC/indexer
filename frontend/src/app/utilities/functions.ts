/**
 * Remove the spelling accents may contain the given text.
 * https://stackoverflow.com/a/37511463
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Order some items based on an order array (of strings), regarding a key of each item.
 * https://gist.github.com/ecarter/1423674#gistcomment-3065491
 */
export function _sortByOrder(items: any[], order: string[], key: string): any[] {
  return items.sort((a, b) => order.indexOf(a[key]) < order.indexOf(b[key]) ? -1 : 1)
}

/**
 * Sort the given items array of objects that match a given input by a given property (key):
 * 1. First: Items with starting match of their key, then sort them by that key.
 * 2. Second: Items without starting match and with a match at any place of their key, then sort them by that key.
 * 3. Third: Items without matches of their key.
 */
export function customSort(items: any[], input: string, key: string) {
  let start = []
  let inner = []
  let others = []
  items.forEach(item => {
    if (item[key].startsWith(input)) {
      start.push(item)
    } else if (item[key].includes(input)) {
      inner.push(item)
    } else {
      others.push(item)
    }
  })
  start = start.sort((a, b) => a[key].localeCompare(b[key]))
  inner = inner.sort((a, b) => a[key].localeCompare(b[key]))
  others = others.sort((a, b) => a[key].localeCompare(b[key]))
  return start.concat(inner).concat(others)
}
