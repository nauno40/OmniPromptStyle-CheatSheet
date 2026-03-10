import React from 'react';

export const About: React.FC = () => {
    return (
        <section id="about">
            <h3>Data and Documentation</h3>
            <p>
                OmniPromptStyle is designed as a universal reference for AI image generation styles, supporting multiple models such as Stable Diffusion, FLUX, and others.
            </p>
            <p style={{ display: 'inline-block', margin: 0, padding: '10px', backgroundColor: 'var(--dgr)' }}>
                This project aims to provide a centralized hub for artists and prompters to explore visual styles across different latent diffusion architectures.
            </p>
            <p style={{ marginTop: '1rem' }}>
                Originally focused on Stable Diffusion 1.5, the platform is evolving to become a model-agnostic guide for the generative art community.
            </p>

            <h3>Credits & Origins</h3>
            <p>A BIG THANK YOU TO</p>
            <p>
                Based on the original <a href="https://github.com/SupaGruen/StableDiffusion-CheatSheet" target="_blank" rel="noreferrer">Stable Diffusion Cheat Sheet</a> by SupaGruen.
            </p>
            <p>
                Metadata viewing logic adapted from Himuro-Majika's <a href="https://github.com/himuro-majika/Stable_Diffusion_image_metadata_viewer" target="_blank" rel="noreferrer">browser extension</a>.
            </p>
            <p>
                Reading metadata with <a href="https://github.com/mattiasw/ExifReader" target="_blank" rel="noreferrer">ExifReader</a>. Extra search results supported by <a href="https://github.com/aceakash/string-similarity" target="_blank" rel="noreferrer">String-Similarity</a>.
            </p>
            <p>
                Webfont is Google's <a href="https://fonts.google.com/specimen/Roboto" target="_blank" rel="noreferrer">Roboto</a>, SVG icons from <a href="https://github.com/ionic-team/ionicons" target="_blank" rel="noreferrer">Ionicons</a>.
            </p>

            <h3>Community and Tools</h3>
            <p>The generative AI ecosystem is built on incredible open-source tools:</p>
            <ul>
                <li><a href="https://github.com/AUTOMATIC1111/stable-diffusion-webui" target="_blank" rel="noreferrer">Automatic1111 Web UI</a></li>
                <li><a href="https://ommer-lab.com/research/latent-diffusion-models/" target="_blank" rel="noreferrer">LMU</a> & <a href="https://stability.ai/" target="_blank" rel="noreferrer">Stability.ai</a></li>
                <li><a href="https://blackforestlabs.ai/" target="_blank" rel="noreferrer">Black Forest Labs (FLUX)</a></li>
            </ul>

            <h3>Errors</h3>
            <p>
                All information has been collected with the utmost care, however, mistakes happen. Location information is sometimes difficult when artists move very early in life, or the indication of the era, if the lifetime falls between two centuries.
            </p>

            <footer>
                OmniPromptStyle - Cheat Sheets - <a href="https://github.com/SupaGruen/StableDiffusion-CheatSheet">Original Source</a>
            </footer>
        </section>
    );
};
