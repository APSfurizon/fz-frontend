"use client"
import Modal from "@/components/modal";
import { useGallery } from "../_components/galleryProvider"

export default function GalleryPagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { currentMedia, openMedia, closeMedia, modalOpen } = useGallery();
    return <>
        {children}
        <Modal open={modalOpen} onClose={closeMedia} />
    </>
}