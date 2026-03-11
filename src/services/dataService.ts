import artists from '../data/artists.json';
import manifest from '../data/manifest.json';
import { excludedArtists } from '../data/excludedArtists';
import type { Artist, ExcludedArtist } from '../types/artist';
import { formatArtistNameForSearch, removeDiacritics } from '../utils/stringUtils';
import stringSimilarity from 'string-similarity';

export interface SearchResult {
    artists: Artist[];
    similarExcluded: (ExcludedArtist & { displayName: string })[];
    similarAvailable: { name: string; status: number }[];
}

export interface ModelDefinition {
    id: string;
    name: string;
    checkpoints: string[];
}

const END_OF_VER_1_2_0 = 202306072133;

class DataService {
    private allArtists: Artist[] = artists as Artist[];
    private manifest: Record<string, Record<string, string[]>> = manifest as any;
    private activeModel: string;
    private activeCheckpoint: string | null = null;

    private datasets: Record<string, Artist[]> = {};
    private searchArray: Record<string, { displayName: string; status: number | string; original?: any }[]> = {};
    private simpleArray: Record<string, string[]> = {};

    constructor() {
        const models = Object.keys(this.manifest);
        this.activeModel = models.includes('SD15') ? 'SD15' : models[0] || '';
        this.init();
    }

    private init() {
        Object.keys(this.manifest).forEach(modelId => {
            this.datasets[modelId] = [];
            this.searchArray[modelId] = [];
            this.simpleArray[modelId] = [];

            // Get all unique image names across all checkpoints for this model
            const availableImages = new Set<string>();
            Object.values(this.manifest[modelId]).forEach(images => {
                images.forEach(img => availableImages.add(img));
            });

            // Filter artists that have at least one image in this model
            const modelArtists = this.allArtists.filter(a => availableImages.has(a.Image));
            this.datasets[modelId] = modelArtists;

            modelArtists.forEach(artist => {
                const displayName = formatArtistNameForSearch(artist.Name);
                this.searchArray[modelId].push({ displayName, status: 200, original: artist });
                this.simpleArray[modelId].push(displayName);
            });

            // Add excluded artists to search
            excludedArtists.forEach(excl => {
                const displayName = formatArtistNameForSearch(excl.Name, excl.FirstName);
                this.searchArray[modelId].push({ displayName, status: excl.Code });
                this.simpleArray[modelId].push(displayName);
            });
        });
    }

    public getAvailableModels(): ModelDefinition[] {
        return Object.keys(this.manifest).map(id => ({
            id,
            name: id.replace('_', ' '), // Simple formatting
            checkpoints: Object.keys(this.manifest[id])
        }));
    }

    public getActiveModel(): string {
        return this.activeModel;
    }

    public setActiveModel(model: string) {
        this.activeModel = model;
        this.activeCheckpoint = null;
    }

    public getArtists(): Artist[] {
        let list = this.datasets[this.activeModel] || [];
        if (this.activeCheckpoint) {
            const checkpointImages = new Set(this.manifest[this.activeModel]?.[this.activeCheckpoint] || []);
            list = list.filter(a => checkpointImages.has(a.Image));
        }
        return list;
    }

    public getArtistById(id: string): Artist | undefined {
        return this.allArtists.find(a => a.Creation === id);
    }

    public getCategories(): Record<string, number> {
        const categories: Record<string, number> = {};
        this.getArtists().forEach(artist => {
            artist.Category.split(',').forEach(cat => {
                const cleanCat = cat.trim();
                if (cleanCat) categories[cleanCat] = (categories[cleanCat] || 0) + 1;
            });
        });
        return categories;
    }

    public getCheckpoints(): Record<string, number> {
        const checkpoints: Record<string, number> = {};
        const modelCheckpoints = this.manifest[this.activeModel] || {};
        Object.keys(modelCheckpoints).forEach(cp => {
            checkpoints[cp] = modelCheckpoints[cp].length;
        });
        return checkpoints;
    }

    public search(
        query: string,
        favorites: string[] = [],
        category: string | null = null,
        specialFilter: string | null = null,
        checkpoint: string | null = null
    ): SearchResult {
        this.activeCheckpoint = checkpoint;
        let filtered = this.getArtists();

        if (specialFilter === 'Liked') {
            filtered = filtered.filter(a => favorites.includes(a.Creation));
        } else if (specialFilter === 'New') {
            filtered = filtered.filter(a => Number(a.Creation) > END_OF_VER_1_2_0);
        } else if (specialFilter === '†') {
            filtered = filtered.filter(a => !!a.Death);
        } else if (specialFilter === 'Random') {
            filtered = [...filtered].sort(() => Math.random() - 0.5).slice(0, 50);
        }

        if (category) {
            filtered = filtered.filter(a => a.Category.toLowerCase().includes(category.toLowerCase()));
        }

        const normalizedQuery = removeDiacritics(query.toLowerCase().trim());
        if (normalizedQuery) {
            filtered = filtered.filter(artist => {
                const searchStr = removeDiacritics(`${artist.Name} ${artist.Category} ${artist.Prompt}`).toLowerCase();
                return searchStr.includes(normalizedQuery);
            });
        }

        // Similarity search logic remains compatible
        let similarExcluded: (ExcludedArtist & { displayName: string })[] = [];
        let similarAvailable: { name: string; status: number }[] = [];

        if (normalizedQuery && filtered.length === 0) {
            const matches = stringSimilarity.findBestMatch(query, this.simpleArray[this.activeModel] || []);
            matches.ratings.forEach((rating) => {
                if (rating.rating > 0.4) {
                    const searchItem = (this.searchArray[this.activeModel] || []).find(item => item.displayName === rating.target);
                    if (searchItem) {
                        if (searchItem.status !== 200) {
                            const excl = excludedArtists.find(e => formatArtistNameForSearch(e.Name, e.FirstName) === searchItem.displayName);
                            if (excl) similarExcluded.push({ ...excl, displayName: searchItem.displayName });
                        } else {
                            similarAvailable.push({ name: searchItem.displayName, status: 200 });
                        }
                    }
                }
            });
        }

        return { artists: filtered, similarExcluded, similarAvailable };
    }

    public resolveImagePath(artist: Artist): string {
        // Find which checkpoint this artist belongs to in the active model
        const modelData = this.manifest[this.activeModel];
        if (!modelData) return `/img/${artist.Image}`;

        // If a checkpoint is selected, use it. Otherwise, find the first checkpoint that has this image.
        let checkpoint = this.activeCheckpoint;
        if (!checkpoint) {
            checkpoint = Object.keys(modelData).find(cp => modelData[cp].includes(artist.Image)) || Object.keys(modelData)[0];
        }

        return `/img/style/${this.activeModel}/${checkpoint}/${artist.Image}`;
    }
}

export const dataService = new DataService();
