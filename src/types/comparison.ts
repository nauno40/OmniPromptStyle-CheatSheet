export type ComparisonItem = {
    id: string; // Composite key: artistId-modelId-checkpointId
    artistId: string; // artist.Creation
    modelId: string;
    checkpointId: string | null;
    artistName: string;
    category: string;
    image: string;
    prompt: string;
}

export const COMP_VERSION = '1.0';
