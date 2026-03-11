import type { Artist } from '../types/artist';
import { dataService } from '../services/dataService';

export const resolveImagePath = (artist: Artist): string => {
    return dataService.resolveImagePath(artist);
};
