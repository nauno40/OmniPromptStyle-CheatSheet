import type { ComparisonItem } from '../types/comparison';

const STORAGE_KEY = 'stable_diffusion_cheat_sheet_comparison';

class ComparisonService {
    private items: ComparisonItem[] = [];
    private listeners: (() => void)[] = [];

    constructor() {
        this.load();
    }

    private load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load comparison items', e);
            this.items = [];
        }
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
        this.notify();
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    public subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public getItems(): ComparisonItem[] {
        return this.items;
    }

    public addItem(item: ComparisonItem) {
        if (!this.items.find(i => i.id === item.id)) {
            this.items.push(item);
            this.save();
        }
    }

    public removeItem(id: string) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
    }

    public clear() {
        this.items = [];
        this.save();
    }

    public isInComparison(id: string): boolean {
        return this.items.some(i => i.id === id);
    }
}

export const comparisonService = new ComparisonService();
