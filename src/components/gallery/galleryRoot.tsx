import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { GalleryProvider } from "./context/galleryProvider";
import "@/styles/components/gallery.css";

type GalleryRootProps = {
    children?: React.ReactNode,
    getNextData: (currentCursor: number) => Promise<GalleryUploadedMedia[]>
}

export function GalleryRoot(props: Readonly<GalleryRootProps>) {
    return <div className="gallery">
        <GalleryProvider getNextData={props.getNextData}>
            {props.children}
        </GalleryProvider>
    </div>;
}