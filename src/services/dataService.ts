import artists from '../data/artists.json';
import type { Artist } from '../types/artist';
import { formatArtistNameForSearch, removeDiacritics, generatePromptFromName } from '../utils/stringUtils';
import stringSimilarity from 'string-similarity';

export interface SearchResult {
    artists: Artist[];
    similarExcluded: { displayName: string; Name: string; Code: string; Extrainfo: string }[];
    similarAvailable: { name: string; status: number }[];
}

export interface ModelDefinition {
    id: string;
    name: string;
    checkpoints: string[];
}

const END_OF_VER_1_2_0 = 202306072133;

class DataService {
    private allArtistsMetadata: Artist[] = artists as Artist[];
    private manifest: Record<string, Record<string, string[]>> = {};
    private activeModel: string = '';
    private activeCheckpoint: string | null = null;

    private datasets: Record<string, Artist[]> = {};
    private searchArray: Record<string, { displayName: string; status: number | string; original?: unknown }[]> = {};
    private simpleArray: Record<string, string[]> = {};

    constructor() {
        this.discoverImages();
        this.init();
    }

    private discoverImages() {
        // Use Vite's import.meta.glob to find all images in public/img/style
        // Note: the paths are relative to the current file
        // Removing `{ eager: true }` prevents Vite from parsing the images as JS modules on load
        const imageModules = import.meta.glob('/public/img/style/**/*.{webp,png,jpg,jpeg}');
        
        const newManifest: Record<string, Record<string, string[]>> = {};

        Object.keys(imageModules).forEach(fullPath => {
            // Path format: /public/img/style/Model/Checkpoint/Artist.webp
            const parts = fullPath.split('/');
            // Parts: ["", "public", "img", "style", "Model", "Checkpoint", "Artist.webp"]
            if (parts.length >= 7) {
                const model = parts[4];
                const checkpoint = parts[5];
                const filename = parts[parts.length - 1];

                if (!newManifest[model]) newManifest[model] = {};
                if (!newManifest[model][checkpoint]) newManifest[model][checkpoint] = [];
                newManifest[model][checkpoint].push(filename);
            }
        });

        this.manifest = newManifest;
        const models = Object.keys(this.manifest);
        this.activeModel = models[0] || '';
    }

    private init() {
        Object.keys(this.manifest).forEach(modelId => {
            this.datasets[modelId] = [];
            this.searchArray[modelId] = [];
            this.simpleArray[modelId] = [];

            const modelData = this.manifest[modelId];
            const availableImages = new Set<string>();
            Object.values(modelData).forEach(images => {
                images.forEach(img => availableImages.add(img));
            });

            // Keep track of which metadata artists we've matched
            const matchedImageFilenames = new Set<string>();
            const modelArtists: Artist[] = [];

            // 1. Match by explicit Image property in metadata
            this.allArtistsMetadata.forEach(artist => {
                if (availableImages.has(artist.Image)) {
                    const artistWithModel = { ...artist, Model: modelId };
                    modelArtists.push(artistWithModel);
                    matchedImageFilenames.add(artist.Image);
                }
            });

            // 2. Process remaining available images (Check if they match metadata name)
            availableImages.forEach(filename => {
                if (matchedImageFilenames.has(filename)) return;

                const nameFromFilename = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '').replace(/[-_]/g, ' ').toLowerCase();
                
                // Try to find by name in metadata (if not already matched)
                const metadataMatch = this.allArtistsMetadata.find(a => 
                    !matchedImageFilenames.has(a.Image) && 
                    formatArtistNameForSearch(a.Name).toLowerCase() === nameFromFilename
                );

                if (metadataMatch) {
                    const artistWithImage = { ...metadataMatch, Image: filename, Model: modelId };
                    modelArtists.push(artistWithImage);
                    matchedImageFilenames.add(filename);
                }
            });

            this.datasets[modelId] = modelArtists;

            modelArtists.forEach(artist => {
                const displayName = formatArtistNameForSearch(artist.Name);
                this.searchArray[modelId].push({ displayName, status: 200, original: artist });
                this.simpleArray[modelId].push(displayName);
            });

            // Add artists without images (e.g., Excluded items) to search for context
            this.allArtistsMetadata.forEach(artist => {
                if (!matchedImageFilenames.has(artist.Image) && artist.Category.startsWith('Excluded')) {
                    const displayName = formatArtistNameForSearch(artist.Name);
                    // Extract the code from "Excluded (204)", or default to 500
                    const match = artist.Category.match(/\((\d+)\)/);
                    const code = match ? parseInt(match[1]) : 500;
                    this.searchArray[modelId].push({ displayName, status: code, original: artist });
                    this.simpleArray[modelId].push(displayName);
                }
            });
        });
    }

    public getAvailableModels(): ModelDefinition[] {
        return Object.keys(this.manifest).map(id => ({
            id,
            name: id,
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
        // First check the active model's dataset (Performance and Correctness)
        const activeDataset = this.datasets[this.activeModel];
        if (activeDataset) {
            const found = activeDataset.find(a => a.Creation === id);
            if (found) return found;
        }

        // Search across all other datasets as fallback
        for (const modelId in this.datasets) {
            if (modelId === this.activeModel) continue;
            const found = this.datasets[modelId].find(a => a.Creation === id);
            if (found) return found;
        }
        return undefined;
    }

    public getCategories(): Record<string, number> {
        const categories: Record<string, number> = {};
        this.getArtists().forEach(artist => {
            const cats = artist.Category.split(',');
            cats.forEach(cat => {
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
                const dynamicPrompt = generatePromptFromName(artist.Name);
                const searchStr = removeDiacritics(`${artist.Name} ${artist.Category} ${dynamicPrompt}`).toLowerCase();
                return searchStr.includes(normalizedQuery);
            });
        }

        const similarExcluded: { displayName: string; Name: string; Code: string; Extrainfo: string }[] = [];
        const similarAvailable: { name: string; status: number }[] = [];

        if (normalizedQuery && filtered.length === 0) {
            const matches = stringSimilarity.findBestMatch(query, this.simpleArray[this.activeModel] || []);
            matches.ratings.forEach((rating) => {
                if (rating.rating > 0.4) {
                    const searchItem = (this.searchArray[this.activeModel] || []).find(item => item.displayName === rating.target);
                    if (searchItem) {
                        if (searchItem.status !== 200) {
                            const artist = searchItem.original as Artist | undefined;
                            similarExcluded.push({ 
                                displayName: searchItem.displayName, 
                                Name: artist?.Name || searchItem.displayName,
                                Code: searchItem.status.toString(),
                                Extrainfo: artist?.Category || ''
                            });
                        } else {
                            similarAvailable.push({ name: searchItem.displayName, status: 200 });
                        }
                    }
                }
            });
        }

        return { artists: filtered, similarExcluded, similarAvailable };
    }

    public getArtistVersions(artist: Artist): Artist[] {
        const versions: Artist[] = [];
        const artistName = formatArtistNameForSearch(artist.Name).toLowerCase();

        Object.keys(this.datasets).forEach(modelId => {
            const modelArtists = this.datasets[modelId];
            modelArtists.forEach(a => {
                const aName = formatArtistNameForSearch(a.Name).toLowerCase();
                // Match by original Creation ID or Name
                if (a.Creation === artist.Creation || aName === artistName) {
                    versions.push(a);
                }
            });
        });

        return versions;
    }

    public resolveImagePath(artist: Artist): string {
        const baseUrl = import.meta.env.BASE_URL;
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        const targetModel = artist.Model || this.activeModel;
        const modelData = this.manifest[targetModel];
        if (!modelData) {
             // Fallback to simple path if manifest missing but image exists
             return `${cleanBaseUrl}/img/${artist.Image}`;
        }

        // Find which checkpoint contains this image in the target model
        let checkpoint = artist.Checkpoint && modelData[artist.Checkpoint]?.includes(artist.Image) 
            ? artist.Checkpoint 
            : null;

        if (!checkpoint) {
            for (const cp in modelData) {
                if (modelData[cp].includes(artist.Image)) {
                    checkpoint = cp;
                    break;
                }
            }
        }

        if (!checkpoint) checkpoint = Object.keys(modelData)[0];

        return `${cleanBaseUrl}/img/style/${targetModel}/${checkpoint}/${artist.Image}`;
    }
}

export const dataService = new DataService();
