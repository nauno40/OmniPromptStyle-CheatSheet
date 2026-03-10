import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { metadataService } from '../../services/metadataService';
import type { SDMetadata } from '../../services/metadataService';
import styles from './MetadataViewer.module.css';

export const MetadataViewer: React.FC = () => {
    const [metadata, setMetadata] = useState<SDMetadata | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please drop an image file.');
            return;
        }

        setError(null);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        try {
            const data = await metadataService.extractMetadata(file);
            setMetadata(data);
        } catch (err) {
            setError('Could not extract metadata.');
            console.error(err);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImagePreview(null);
        setMetadata(null);
        setError(null);
    };

    return (
        <section className={styles.metadataPage}>
            <h3>Image Metadata</h3>
            <p>This will check an image for embedded Stable Diffusion data.</p>

            <div className={styles.metadataboxes}>
                <div
                    className={clsx(styles.dropArea, isDragging && styles.highlight)}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('fileElem')?.click()}
                >
                    {imagePreview && (
                        <span className={styles.clearimage} onClick={clearImage}>&times;</span>
                    )}

                    {!imagePreview && <p>Drop Image Here</p>}

                    <input
                        type="file"
                        id="fileElem"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={onFileSelect}
                    />

                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className={styles.preview} />
                    )}
                </div>

                {error && <p style={{ color: '#ffb3ba', marginTop: '1rem' }}>{error}</p>}

                {metadata && (
                    <div className={styles.allMetaData}>
                        <div className={styles.metaSection}>
                            <p><strong className={styles.metaLabel}>Prompt</strong></p>
                            <span className={styles.metaPrompt}>{metadata.positive}</span>
                        </div>

                        {metadata.negative && (
                            <div className={styles.metaSection}>
                                <p><strong className={styles.metaLabel}>Negative Prompt</strong></p>
                                <span className={styles.metaValue}>{metadata.negative}</span>
                            </div>
                        )}

                        <div className={styles.metaSection}>
                            <p><strong className={styles.metaLabel}>Settings</strong></p>
                            <span className={styles.metaValue}>
                                Steps: {metadata.steps}, Sampler: {metadata.sampler}, CFG scale: {metadata.cfgScale}, Seed: {metadata.seed}, Size: {metadata.size}
                                {metadata.modelHash && `, Model hash: ${metadata.modelHash}`}
                                {metadata.model && `, Model: ${metadata.model}`}
                            </span>
                        </div>

                        <button
                            className={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(metadata.positive || '')}
                        >
                            Copy Prompt
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};
