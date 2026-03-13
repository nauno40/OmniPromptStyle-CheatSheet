export type ModelType = string;

export interface Artist {
    Name: string;
    Born: string;
    Death: string;
    Prompt: string;
    Category: string;
    Checkpoint: string;
    Image: string;
    Creation: string;
    Model: ModelType;
}

export interface ExcludedArtist {
    Name: string;
    FirstName: string;
    Code: string;
    Extrainfo: string;
}
