export interface Artist {
    Type: string;
    Name: string;
    Born: string;
    Death: string;
    Prompt: string;
    NPrompt: string;
    Category: string;
    Checkpoint: string;
    Extrainfo: string;
    Image: string;
    Creation: string;
}

export interface ExcludedArtist {
    Name: string;
    FirstName: string;
    Code: string;
    Extrainfo: string;
}
