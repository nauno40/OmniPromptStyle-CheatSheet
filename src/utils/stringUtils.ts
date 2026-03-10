/**
 * Removes diacritics (accents) from a string.
 */
export function removeDiacritics(str: string): string {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/**
 * Creates a URL-safe anchor from a string.
 */
export function createAnchor(name: string): string {
    return removeDiacritics(name)
        .replace(/[^a-zA-Z]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Formats artist name for search similarity.
 * Original logic: replace parenthetical info and split/reorder.
 */
export function formatArtistNameForSearch(name: string, firstName?: string): string {
    if (firstName) {
        return `${firstName} ${name}`;
    }
    const cleanName = name.replace(/ *\([^)]*\) */g, '').split(',').map(item => item.trim());
    const part1 = cleanName[0];
    const part2 = cleanName[1];
    return part2 ? `${part2} ${part1}` : part1;
}
