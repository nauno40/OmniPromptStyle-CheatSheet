import React from 'react';
import { Header } from './Header';
import { useGallery } from '../../hooks/useGallery';

interface LayoutProps {
    children: React.ReactNode | ((props: ReturnType<typeof useGallery>) => React.ReactNode);
    galleryState: ReturnType<typeof useGallery>;
}

export const Layout: React.FC<LayoutProps> = ({ children, galleryState }) => {
    return (
        <div className="app-container">
            <Header
                activeModel={galleryState.activeModel}
                setActiveModel={galleryState.setActiveModel}
                searchQuery={galleryState.searchQuery}
                setSearchQuery={galleryState.setSearchQuery}
                showFilters={galleryState.showFilters}
                setShowFilters={galleryState.setShowFilters}
                styleCount={galleryState.styleCount}
            />
            <main>
                {typeof children === 'function' ? children(galleryState) : children}
            </main>
        </div>
    );
};
