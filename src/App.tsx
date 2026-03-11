import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { FilterBar } from './components/search/FilterBar';
import { GalleryGrid } from './components/gallery/GalleryGrid';
import { Modal } from './components/ui/Modal';
import { ArtistModal } from './components/ui/ArtistModal';
import { MetadataViewer } from './components/metadata/MetadataViewer';
import { Notes } from './components/pages/Notes';
import { About } from './components/pages/About';
import { useGallery } from './hooks/useGallery';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const galleryState = useGallery();

  const selectedArtistData = useMemo(() => {
    if (!galleryState.selectedArtist) return null;
    return dataService.getArtistById(galleryState.selectedArtist);
  }, [galleryState.selectedArtist, galleryState.activeModel]);

  return (
    <Router>
      <Layout galleryState={galleryState}>
        {() => (
          <Routes>
            <Route path="/" element={
              <>
                <FilterBar
                  categories={galleryState.categories}
                  onCategorySelect={galleryState.setSelectedCategory}
                  activeCategory={galleryState.selectedCategory}
                  checkpoints={galleryState.checkpoints}
                  onCheckpointSelect={galleryState.setSelectedCheckpoint}
                  activeCheckpoint={galleryState.selectedCheckpoint}
                  onSpecialFilterSelect={galleryState.setSelectedSpecialFilter}
                  activeSpecialFilter={galleryState.selectedSpecialFilter}
                  show={galleryState.showFilters}
                  onClose={() => galleryState.setShowFilters(false)}
                />
                <GalleryGrid
                  artists={galleryState.searchResults.artists}
                  onSelectArtist={galleryState.selectArtist}
                  similarExcluded={galleryState.similarExcluded}
                  similarAvailable={galleryState.similarAvailable}
                  onSimilarClick={galleryState.setSearchQuery}
                  searchQuery={galleryState.searchQuery}
                />
              </>
            } />
            <Route path="/metadata" element={<MetadataViewer />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/about" element={<About />} />
          </Routes>
        )}
      </Layout>

      <Modal
        isOpen={!!galleryState.selectedArtist}
        onClose={() => galleryState.selectArtist(null)}
      >
        {selectedArtistData && (
          <ArtistModal
            artist={selectedArtistData}
            isFavorite={galleryState.favorites.includes(selectedArtistData.Creation)}
            onToggleFavorite={galleryState.toggleFavorite}
          />
        )}
      </Modal>

      <div id="modal-root"></div>
    </Router>
  );
};

export default App;
