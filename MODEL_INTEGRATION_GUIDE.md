# Guide : Ajouter un Nouveau Modèle (SDXL, Flux 2, etc.)

Grâce au nouveau système de registre, l'application est maintenant modulaire. Ajouter un modèle (SDXL, Flux 2, etc.) ne nécessite plus de modifier le code de base.

## 📋 Étapes Rapides

### 1. Créer le Fichier de Données
Créez `src/data/artists_sdxl.ts` (par exemple) en vous basant sur `src/data/artists.ts`. 
Assurez-vous que chaque artiste a le bon identifiant de modèle : `Model: "sdxl"`.

### 2. Organiser les Images
Créez un dossier dédié pour vos images :
- Chemin : `public/img/sdxl/`
- Ajoutez vos fichiers WebP à l'intérieur.

### 3. Enregistrer le Modèle
Modifiez **`src/data/modelRegistry.ts`** pour inclure votre nouveau modèle :

```typescript
import { artistsSdxl } from './artists_sdxl';

export const modelRegistry: ModelDefinition[] = [
    // ... existants
    {
        id: 'sdxl',           // ID interne (doit correspondre au champ 'Model' des données)
        name: 'SDXL 1.0',     // Texte affiché dans le sélecteur (Header)
        data: artistsSdxl,    // Référence aux données importées
        imgDir: '/img/sdxl/'  // Chemin vers vos images
    }
];
```

---

## 🚀 Pourquoi ce format ?
- **Interface Automatique** : Le nouveau bouton apparaît seul dans le Header.
- **Isolant** : Les erreurs dans un modèle n'impactent pas les autres.
- **Réactif** : Les filtres (catégories, checkpoints) se mettent à jour instantanément.
- **Standardisé** : Le chemin des images est géré par un utilitaire central (`resolveImagePath`).
