import artists from '../data/artists.json';
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
    private allArtistsMetadata: Artist[] = artists as Artist[];
    private manifest: Record<string, Record<string, string[]>> = {};
    private activeModel: string = '';
    private activeCheckpoint: string | null = null;

    private datasets: Record<string, Artist[]> = {};
    private searchArray: Record<string, { displayName: string; status: number | string; original?: any }[]> = {};
    private simpleArray: Record<string, string[]> = {};

    constructor() {
        this.discoverImages();
        this.init();
    }

    private discoverImages() {
        // Use Vite's import.meta.glob to find all images in public/img/style
        // Note: the paths are relative to the current file
        const imageModules = import.meta.glob('/public/img/style/**/*.{webp,png,jpg,jpeg}', { eager: true });
        
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

    private parseArtistNameFromFilename(filename: string): string {
        const nameWithoutExt = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
        // Replace dashes and underscores with spaces
        const parts = nameWithoutExt.split(/[-_]/).filter(p => p.length > 0);
        return parts.join(' ');
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

            // 2. Process remaining available images (Hybrid matching or Virtual Artists)
            availableImages.forEach(filename => {
                if (matchedImageFilenames.has(filename)) return;

                const parsedName = this.parseArtistNameFromFilename(filename);
                
                // Try to find by parsed name in metadata (if not already matched)
                const metadataMatch = this.allArtistsMetadata.find(a => 
                    !matchedImageFilenames.has(a.Image) && 
                    formatArtistNameForSearch(a.Name).toLowerCase() === parsedName.toLowerCase()
                );

                if (metadataMatch) {
                    // Update and add the metadata artist
                    const artistWithImage = { ...metadataMatch, Image: filename, Model: modelId };
                    modelArtists.push(artistWithImage);
                    matchedImageFilenames.add(filename);
                } else {
                    // Create a Virtual Artist
                    const virtualArtist: Artist = {
                        Type: "Unknown",
                        Name: parsedName,
                        Born: "",
                        Death: "",
                        Prompt: `style of ${parsedName}`,
                        NPrompt: "",
                        Category: "Uncategorized",
                        Checkpoint: "Unknown",
                        Extrainfo: "Automatically discovered",
                        Image: filename,
                        Creation: `virtual-${modelId}-${filename}`,
                        Model: modelId
                    };
                    modelArtists.push(virtualArtist);
                }
            });

            this.datasets[modelId] = modelArtists;

            modelArtists.forEach(artist => {
                const displayName = formatArtistNameForSearch(artist.Name);
                this.searchArray[modelId].push({ displayName, status: 200, original: artist });
                this.simpleArray[modelId].push(displayName);
            });

            // Add excluded artists to search for context
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
            filtered = filtered.filter(a => !a.Creation.startsWith('virtual-') && Number(a.Creation) > END_OF_VER_1_2_0);
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

    public getArtistVersions(artist: Artist): Artist[] {
        const versions: Artist[] = [];
        const artistName = formatArtistNameForSearch(artist.Name).toLowerCase();
        const isVirtual = artist.Creation.startsWith('virtual-');

        Object.keys(this.datasets).forEach(modelId => {
            const modelArtists = this.datasets[modelId];
            modelArtists.forEach(a => {
                const aName = formatArtistNameForSearch(a.Name).toLowerCase();
                const aIsVirtual = a.Creation.startsWith('virtual-');

                if (isVirtual) {
                    // For virtual artists, match by name and virtual status
                    if (aIsVirtual && aName === artistName) {
                        versions.push(a);
                    }
                } else {
                    // For metadata artists, match by original Creation ID or Name
                    if (!aIsVirtual && (a.Creation === artist.Creation || aName === artistName)) {
                        versions.push(a);
                    }
                }
            });
        });

        return versions;
    }

    public resolveImagePath(artist: Artist): string {
        const targetModel = artist.Model || this.activeModel;
        const modelData = this.manifest[targetModel];
        if (!modelData) {
             // Fallback to simple path if manifest missing but image exists
             return `/img/${artist.Image}`;
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

        return `/img/style/${targetModel}/${checkpoint}/${artist.Image}`;
    }
}

export const dataService = new DataService();
