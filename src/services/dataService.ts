import { artists } from '../data/artists';
import { excludedArtists } from '../data/excludedArtists';
import type { Artist, ExcludedArtist } from '../types/artist';
import { formatArtistNameForSearch, removeDiacritics } from '../utils/stringUtils';
import stringSimilarity from 'string-similarity';

export interface SearchResult {
    artists: Artist[];
    similarExcluded: (ExcludedArtist & { displayName: string })[];
    similarAvailable: { name: string; status: number }[];
}

const END_OF_VER_1_2_0 = 202306072133;

class DataService {
    private allArtists: Artist[] = artists;
    private allExcluded: ExcludedArtist[] = excludedArtists;

    // Memoized search arrays for performance
    private searchArray: { displayName: string; status: number | string; original?: any }[] = [];
    private simpleArray: string[] = [];

    constructor() {
        this.initSearchArrays();
    }

    private initSearchArrays() {
        this.allArtists.forEach(artist => {
            const displayName = formatArtistNameForSearch(artist.Name);
            this.searchArray.push({ displayName, status: 200, original: artist });
            this.simpleArray.push(displayName);
        });

        this.allExcluded.forEach(excl => {
            const displayName = formatArtistNameForSearch(excl.Name, excl.FirstName);
            this.searchArray.push({ displayName, status: excl.Code });
            this.simpleArray.push(displayName);
        });
    }

    public getArtists(): Artist[] {
        return this.allArtists;
    }

    public getArtistById(id: string): Artist | undefined {
        return this.allArtists.find(a => a.Creation === id);
    }

    public getCategories(): Record<string, number> {
        const categories: Record<string, number> = {};
        this.allArtists.forEach(artist => {
            const artistCats = artist.Category.split(',');
            artistCats.forEach(cat => {
                const cleanCat = cat.trim();
                if (cleanCat) {
                    categories[cleanCat] = (categories[cleanCat] || 0) + 1;
                }
            });
        });
        return categories;
    }

    public search(
        query: string,
        favorites: string[] = [],
        category: string | null = null,
        specialFilter: string | null = null
    ): SearchResult {
        let filtered = [...this.allArtists];

        // 1. Process Special Filters
        if (specialFilter === 'Liked') {
            filtered = filtered.filter(a => favorites.includes(a.Creation));
        } else if (specialFilter === 'New') {
            filtered = filtered.filter(a => Number(a.Creation) > END_OF_VER_1_2_0);
        } else if (specialFilter === 'Random') {
            // Just a shuffle or random pick? Original random usually just picks one or shuffles.
            // For now, let's just shuffle a subset.
            filtered = [...filtered].sort(() => Math.random() - 0.5).slice(0, 50);
        } else if (specialFilter === '†') {
            filtered = filtered.filter(a => !!a.Death);
        }

        // 2. Process Category
        if (category) {
            filtered = filtered.filter(a => a.Category.includes(category));
        }

        // 3. Process Text Query
        const normalizedQuery = removeDiacritics(query.toLowerCase().trim());
        if (normalizedQuery) {
            filtered = filtered.filter(artist => {
                const searchStr = removeDiacritics(`${artist.Name} ${artist.Category} ${artist.Prompt}`).toLowerCase();
                return searchStr.includes(normalizedQuery);
            });
        }

        // 4. Similarity search for excluded artists (only if text query exists)
        let similarExcluded: (ExcludedArtist & { displayName: string })[] = [];
        let similarAvailable: { name: string; status: number }[] = [];

        if (normalizedQuery && filtered.length === 0) {
            const matches = stringSimilarity.findBestMatch(query, this.simpleArray);
            matches.ratings.forEach((rating) => {
                if (rating.rating > 0.4) {
                    const searchItem = this.searchArray.find(item => item.displayName === rating.target);
                    if (searchItem) {
                        if (searchItem.status !== 200) {
                            const excl = this.allExcluded.find(e => formatArtistNameForSearch(e.Name, e.FirstName) === searchItem.displayName);
                            if (excl) {
                                similarExcluded.push({ ...excl, displayName: searchItem.displayName });
                            }
                        } else {
                            similarAvailable.push({ name: searchItem.displayName, status: 200 });
                        }
                    }
                }
            });
        }

        return {
            artists: filtered,
            similarExcluded,
            similarAvailable
        };
    }
}

export const dataService = new DataService();
