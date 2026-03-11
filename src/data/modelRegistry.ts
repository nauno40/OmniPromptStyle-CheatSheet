import { artists } from './artists';
import { artistsFlux } from './artists_flux';
import type { Artist } from '../types/artist';

export interface ModelDefinition {
    id: string;
    name: string;
    data: Artist[];
    imgDir: string;
}

export const modelRegistry: ModelDefinition[] = [
    {
        id: 'sd15',
        name: 'SD 1.5',
        data: artists,
        imgDir: '/img/'
    },
    {
        id: 'flux',
        name: 'FLUX.1',
        data: artistsFlux,
        imgDir: '/img/flux/'
    }
];

export const getModelById = (id: string) => modelRegistry.find(m => m.id === id);
