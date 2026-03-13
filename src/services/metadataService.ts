import ExifReader from 'exifreader';

export interface SDMetadata {
    positive?: string;
    negative?: string;
    steps?: string;
    sampler?: string;
    cfgScale?: string;
    seed?: string;
    size?: string;
    model?: string;
    modelHash?: string;
    others?: Record<string, string>;
    originalMD?: string;
    ui?: string;
}

class MetadataService {
    public async extractMetadata(file: File): Promise<SDMetadata | null> {
        try {
            const tags = await ExifReader.load(file);

            // Check common SD metadata tags
            const userComment = tags.UserComment as { value?: unknown };
            if (userComment && userComment.value) {
                const comment = this.decodeUnicode(userComment.value as number[]);
                if (comment) return this.parseA1111(comment);
            }

            const parameters = tags.parameters as { description?: string };
            if (parameters && parameters.description) {
                const params = parameters.description;
                if (params) return this.parseA1111(params);
            }

            const prompt = tags.prompt as { value?: string };
            if (prompt && prompt.value) {
                try {
                    const comfyPrompt = JSON.parse(prompt.value as string);
                    return this.parseComfy(comfyPrompt);
                } catch {
                    console.error("Failed to parse ComfyUI prompt");
                }
            }

            return null;
        } catch (e) {
            console.error("Error reading EXIF data", e);
            return null;
        }
    }

    private decodeUnicode(array: number[]): string | null {
        // Simple hex/unicode decoding as in original script
        const plain = array.map(t => t.toString(16).padStart(2, '0')).join('');
        if (!plain.startsWith('554e49434f44450')) {
            return new TextDecoder().decode(new Uint8Array(array));
        }

        try {
            const hex = plain.replace(/^554e49434f44450[0-9]/, '').replace(/[0-9a-f]{4}/g, ',0x$&').replace(/^,/, '');
            return hex.split(',').map(v => String.fromCodePoint(parseInt(v, 16))).join('');
        } catch {
            return null;
        }
    }

    private parseA1111(text: string): SDMetadata {
        const metadata: SDMetadata = { originalMD: text, ui: 'Automatic1111' };

        // Positive Prompt
        const posMatch = text.match(/([^]+?)(Negative prompt: |Steps: |{"steps"|\[[^[]+\])/);
        metadata.positive = posMatch ? posMatch[1].trim() : text.split('\n')[0].trim();

        // Negative Prompt
        const negMatch = text.match(/Negative prompt: ([^]+?)(Steps: |$)/);
        if (negMatch) metadata.negative = negMatch[1].trim();

        // Parameters
        const paramsMatch = text.match(/Steps: ([^]+)/);
        if (paramsMatch) {
            const params = paramsMatch[1];
            metadata.others = {};
            params.split(',').forEach(param => {
                const [key, ...valueParts] = param.split(':');
                if (key && valueParts.length > 0) {
                    const k = key.trim().toLowerCase();
                    const v = valueParts.join(':').trim();
                    if (k === 'steps') metadata.steps = v;
                    else if (k === 'sampler') metadata.sampler = v;
                    else if (k === 'cfg scale') metadata.cfgScale = v;
                    else if (k === 'seed') metadata.seed = v;
                    else if (k === 'size') metadata.size = v;
                    else if (k === 'model') metadata.model = v;
                    else if (k === 'model hash') metadata.modelHash = v;
                    else metadata.others![key.trim()] = v;
                }
            });
        }

        return metadata;
    }

    private parseComfy(json: Record<string, unknown>): SDMetadata {
        const metadata: SDMetadata = { ui: 'ComfyUI', others: {}, originalMD: JSON.stringify(json, null, 2) };

        // ComfyUI metadata is node-based and highly variable. 
        // We'll flatten it for display as in the original site logic.
        const flatten = (obj: Record<string, unknown>, prefix = '') => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    flatten(obj[key] as Record<string, unknown>, `${prefix}${key}.`);
                } else {
                    metadata.others![`${prefix}${key}`] = String(obj[key]);
                }
            }
        };
        flatten(json);

        return metadata;
    }
}

export const metadataService = new MetadataService();
