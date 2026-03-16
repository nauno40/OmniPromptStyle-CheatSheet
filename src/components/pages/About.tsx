import React from 'react';

export const About: React.FC = () => {
    return (
        <section id="about">
            <h3>Data and Documentation</h3>
            <p>
                OmniPromptStyle is designed as a visual and searchable database of styles generated through an automated <strong>ComfyUI workflow</strong>.
            </p>
            <p style={{ display: 'inline-block', margin: 0, padding: '10px', backgroundColor: 'var(--dgr)' }}>
                Its primary goal is to help AI artists systematically observe, document, and compare how different models (SD 1.5, SDXL, Flux) react to the exact same artist prompt.
            </p>
            <p style={{ marginTop: '1rem' }}>
                It acts as an invaluable reference tool to eliminate guesswork when trying to achieve a specific artistic vision across different generative models.
            </p>

            <h3>Credits & Origins</h3>
            <p>A BIG THANK YOU TO</p>
            <p>
                <a href="https://github.com/andygock" target="_blank" rel="noreferrer"><strong>Andy Gock</strong></a> for the <a href="https://github.com/andygock/FLUX-Style-CheatSheet" target="_blank" rel="noreferrer">FLUX-Style-CheatSheet</a>, which served as the source for all the FLUX styles featured in this database.
            </p>
            <p>
                Based on the original <a href="https://github.com/SupaGruen/StableDiffusion-CheatSheet" target="_blank" rel="noreferrer">Stable Diffusion Cheat Sheet</a> by <a href="https://github.com/SupaGruen" target="_blank" rel="noreferrer">SupaGruen</a>.
            </p>
            <p>
                Metadata viewing logic adapted from <a href="https://github.com/himuro-majika" target="_blank" rel="noreferrer">Himuro-Majika's</a> <a href="https://github.com/himuro-majika/Stable_Diffusion_image_metadata_viewer" target="_blank" rel="noreferrer">browser extension</a>.
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
