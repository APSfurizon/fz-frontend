"use client"
import { GalleryProvider } from "../_components/galleryProvider";
import ViewMediaModal from "../_components/viewMediaModal";

export default function UploadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <GalleryProvider>
        {children}
        <ViewMediaModal />
    </GalleryProvider>
}