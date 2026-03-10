const FAVORITES_KEY = 'sd-cheatsheet-stars';

class FavoriteService {
    public getFavorites(): string[] {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (!stored) return [];
        return stored.split(',').filter(id => id.length > 0);
    }

    public toggleFavorite(id: string): string[] {
        let favorites = this.getFavorites();
        if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
        } else {
            favorites.push(id);
        }
        localStorage.setItem(FAVORITES_KEY, favorites.join(','));
        return favorites;
    }

    public setFavorites(favorites: string[]): void {
        localStorage.setItem(FAVORITES_KEY, favorites.join(','));
    }
}

export const favoriteService = new FavoriteService();
