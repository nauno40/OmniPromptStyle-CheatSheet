import React, { useState } from 'react';
import { clsx } from 'clsx';
import styles from './Notes.module.css';

const MEDIA_EXAMPLES = [
    { name: 'Photo, DSLR', path: '/img/types/00-photo.webp' },
    { name: 'Analog Photo', path: '/img/types/01-analog-photo.webp' },
    { name: 'Lomography Photo', path: '/img/types/15-lomography.webp' },
    { name: 'Pinhole Photo', path: '/img/types/17-pinhole.webp' },
    { name: 'BW Photo', path: '/img/types/31-bw-photo.webp' },
    { name: 'Wet-Plate Photo', path: '/img/types/02-wet-plate-photo.webp' },
    { name: 'Daguerreotype', path: '/img/types/14-daguerreotype.webp' },
    { name: 'Cyanotype', path: '/img/types/43-cyanotype.webp' },
    { name: 'Anthotype Photo', path: '/img/types/44-anthotype-photo.webp' }
];

const DRAWING_EXAMPLES = [
    { name: 'Pencil Drawing', path: '/img/types/03-pencil-drawing.webp' },
    { name: 'Pen and Ink Drawing', path: '/img/types/04-pen-and-ink-drawing.webp' },
    { name: 'Ink Drawing', path: '/img/types/13-ink-drawing.webp' },
    { name: 'Watercolor Painting', path: '/img/types/06-watercolor-painting.webp' },
    { name: 'Pen and Watercolor Painting', path: '/img/types/07-pen-and-watercolor-painting.webp' },
    { name: 'Oil Painting', path: '/img/types/08-oil-painting.webp' },
    { name: 'Acrylic Painting', path: '/img/types/09-acrylic-painting.webp' },
    { name: 'Rough Charcoal Sketch', path: '/img/types/10-rough-charcoal-sketch.webp' },
    { name: 'Crayon Drawing', path: '/img/types/20-crayon-drawing.webp' },
    { name: 'Engraving Illustration', path: '/img/types/05-engraving-illustration.webp' },
    { name: 'Mezzotint', path: '/img/types/24-mezzotint-print.webp' },
    { name: 'Risograph Print', path: '/img/types/26-risograph-print.webp' },
    { name: 'Linocut', path: '/img/types/25-linocut-print.webp' },
    { name: 'Colored Linocut', path: '/img/types/27-colored-linocut.webp' }
];

const METHODS_EXAMPLES = [
    { name: 'Impasto Painting', path: '/img/types/46-impasto-painting.webp' },
    { name: 'Palette Knife Oil Painting', path: '/img/types/40-palette-knife-oil-painting.webp' },
    { name: 'Chiaroscuro Painting', path: '/img/types/45-chiaroscuro-painting.webp' },
    { name: 'Iridescent Painting', path: '/img/types/41-iridescent-painting.webp' },
    { name: 'Anaglyph Painting', path: '/img/types/42-anaglyph-painting.webp' }
];

const DIGITAL_EXAMPLES = [
    { name: 'Comic Character', path: '/img/types/16-comic-character.webp' },
    { name: 'Pixel Art', path: '/img/types/19-pixel-art.webp' },
    { name: 'Vector Graphic', path: '/img/types/22-vector-graphic.webp' },
    { name: '3D Render', path: '/img/types/11-3d-render.webp' },
    { name: 'Low Poly Render', path: '/img/types/12-lowpoly-render.webp' },
    { name: 'Modelling Clay', path: '/img/types/18-modelling-clay.webp' },
    { name: 'Papercraft', path: '/img/types/30-papercraft.webp' },
    { name: 'Embroidery Cross Stitch', path: '/img/types/21-embroidery-cross-stitch.webp' },
    { name: 'Bas-Relief Wood Carving', path: '/img/types/28-bas-relief-wood-carving.webp' },
    { name: 'Marble Bust', path: '/img/types/29-marble-bust.webp' }
];

const ART_HISTORY = [
    {
        title: "Renaissance (14th-16th Centuries)",
        artists: ["Leonardo da Vinci", "Michelangelo Buonarroti", "Raffaello Sanzio da Urbino", "Sandro Botticelli"],
        medium: "Oil on wood or canvas"
    },
    {
        title: "Mannerism (16th Century)",
        artists: ["Michelangelo Merisi da Caravaggio", "El Greco", "Benvenuto Cellini", "Jacopo da Pontormo", "Parmigianino", "Bronzino"],
        medium: "Oil on canvas, sculpture, and architecture"
    },
    {
        title: "Baroque (17th Century)",
        artists: ["Michelangelo Merisi da Caravaggio", "Gian Lorenzo Bernini", "Rembrandt van Rijn", "Peter Paul Rubens"],
        medium: "Oil on canvas"
    },
    {
        title: "Rococo (18th Century)",
        artists: ["Jean-Antoine Watteau", "François Boucher", "Jean-Honoré Fragonard"],
        medium: "Oil on canvas"
    },
    {
        title: "Neoclassicism (18th-19th Centuries)",
        artists: ["Jacques-Louis David", "Jean-Auguste-Dominique Ingres", "Antonio Canova"],
        medium: "Oil on canvas"
    },
    {
        title: "Romanticism (late 18th-19th Centuries)",
        artists: ["Joseph Mallord William Turner", "Francisco de Goya y Lucientes", "Eugène Delacroix", "Caspar David Friedrich"],
        medium: "Oil on canvas"
    },
    {
        title: "Realism (mid-19th Century)",
        artists: ["Gustave Courbet", "Honoré Daumier", "Jean-François Millet"],
        medium: "Oil on canvas"
    },
    {
        title: "Impressionism (late 19th Century)",
        artists: ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas", "Mary Cassatt"],
        medium: "Oil on canvas"
    },
    {
        title: "Symbolism (late 19th to early 20th Century)",
        artists: ["Gustave Moreau", "Edvard Munch", "Odilon Redon", "Pierre Puvis de Chavannes", "Fernand Khnopff", "Franz von Stuck"],
        medium: "Oil on canvas, drawing, and printmaking"
    },
    {
        title: "Expressionism (early 20th Century)",
        artists: ["Edvard Munch", "Wassily Kandinsky", "Ernst Ludwig Kirchner"],
        medium: "Oil on canvas or woodcuts"
    },
    {
        title: "Cubism (early 20th Century)",
        artists: ["Pablo Picasso", "Georges Braque", "Juan Gris"],
        medium: "Oil on canvas or collage"
    },
    {
        title: "Futurism (1909-1916)",
        artists: ["Umberto Boccioni", "Giacomo Balla", "Gino Severini"],
        medium: "Oil on canvas or mixed media"
    },
    {
        title: "Dada (1916-1924)",
        artists: ["Marcel Duchamp", "Man Ray", "Hannah Höch", "Jean Arp", "Francis Picabia", "Kurt Schwitters"],
        medium: "Collage, assemblage, and performance"
    },
    {
        title: "Bauhaus (1919-1933)",
        artists: ["Walter Gropius", "Ludwig Mies van der Rohe", "Wassily Kandinsky", "Paul Klee", "Josef Albers"],
        medium: "Architecture, furniture, and graphic design"
    },
    {
        title: "Surrealism (1920s-30s)",
        artists: ["Salvador Dalí", "René Magritte", "Max Ernst"],
        medium: "Oil on canvas or mixed media"
    },
    {
        title: "Abstract Expressionism (1940s-50s)",
        artists: ["Jackson Pollock", "Mark Rothko", "Willem de Kooning"],
        medium: "Oil on canvas or mixed media"
    },
    {
        title: "Pop Art (1950s-60s)",
        artists: ["Andy Warhol", "Roy Lichtenstein", "Richard Hamilton"],
        medium: "Acrylic or oil on canvas or mixed media"
    },
    {
        title: "Minimalism (1960s-70s)",
        artists: ["Donald Judd", "Dan Flavin", "Sol LeWitt"],
        medium: "Acrylic or oil on canvas or mixed media"
    },
    {
        title: "Postmodernism (1970s-90s)",
        artists: ["Cindy Sherman", "Jeff Koons", "Barbara Kruger"],
        medium: "Painting, sculpture, installation, and performance art"
    }
];

export const Notes: React.FC = () => {
    const [baseSize, setBaseSize] = useState(512);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const calculateDim = (ratio: number) => Math.round(baseSize * ratio);

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

    const renderGallery = (title: string, examples: typeof MEDIA_EXAMPLES) => (
        <>
            <h4>{title}</h4>
            <div className={styles.examplegallery}>
                {examples.map(ex => {
                    const fullPath = `${baseUrl}${ex.path}`;
                    return (
                        <figure key={ex.name} className={styles.example}>
                            <a href={fullPath} target="_blank" rel="noreferrer">
                                <img src={fullPath} alt={ex.name} />
                            </a>
                            <figcaption
                                className={styles.caption}
                                onClick={() => copyToClipboard(ex.name)}
                                title="Click to copy"
                            >
                                {ex.name}
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </>
    );

    return (
        <section className={styles.notes}>
            <h3>Prompt Examples - Art Media</h3>

            {renderGallery('Photo', MEDIA_EXAMPLES)}
            {renderGallery('Drawing, Painting, Print', DRAWING_EXAMPLES)}
            {renderGallery('Methods, Looks', METHODS_EXAMPLES)}
            {renderGallery('Digital, Other', DIGITAL_EXAMPLES)}

            <h3>Image Dimensions</h3>
            <p>Stable Diffusion was trained with base dimensions of 512 pixels (SD 1.5) and 768 pixels (SD 2/2.1).<br />
                FLUX.1 [dev] is optimized for 1024 pixels.<br />
                While it's not necessary to stick to multiples of 128, it's a good place to start.</p>

            <div className={styles.numberline}>
                {[128, 256, 384, 512, 640, 768, 896, 1024].map(num => (
                    <span
                        key={num}
                        className={clsx((num === 512 || num === 768) && styles.highlight)}
                        onClick={() => setBaseSize(num)}
                    >
                        {num}
                    </span>
                ))}
            </div>

            <p><strong>Some of the common ratios in SD dimensions:</strong></p>
            <table className={styles.dimensionsTable}>
                <tbody>
                    <tr><td>Square</td><td>1:1</td><td>{baseSize} &times; {baseSize}</td></tr>
                    <tr><td>Photo</td><td>2:3</td><td>{baseSize} &times; {calculateDim(1.5)}</td></tr>
                    <tr><td>Photo</td><td>3:4</td><td>{baseSize} &times; {calculateDim(1.334)}</td></tr>
                    <tr><td>Social Media</td><td>4:5</td><td>{baseSize} &times; {calculateDim(1.25)}</td></tr>
                    <tr><td>Standard Monitor</td><td>16:9</td><td>{calculateDim(1.777)} &times; {baseSize}</td></tr>
                    <tr><td>Monitor</td><td>16:10</td><td>{calculateDim(1.6)} &times; {baseSize}</td></tr>
                    <tr><td>UltraWide Monitor</td><td>21:9</td><td>{calculateDim(2.334)} &times; {baseSize}</td></tr>
                    <tr>
                        <td>Base size</td>
                        <td>
                            <input
                                type="number"
                                className={styles.ratioInput}
                                value={baseSize}
                                onChange={(e) => setBaseSize(parseInt(e.target.value) || 512)}
                            />
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <h3>Art History - Some Pointers</h3>
            <ul className={styles.arthistory}>
                {ART_HISTORY.map((period, idx) => (
                    <li key={idx} className={styles.historyItem}>
                        <h4>{period.title}</h4>
                        <ul className={styles.historySubList}>
                            <li className={styles.historySubItem}>
                                <strong>Famous Artists:</strong> {period.artists.join(', ')}
                            </li>
                            <li className={styles.historySubItem}>
                                <strong>Medium:</strong> {period.medium}
                            </li>
                        </ul>
                    </li>
                ))}
            </ul>
        </section>
    );
};
