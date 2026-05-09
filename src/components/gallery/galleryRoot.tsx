import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { GalleryProvider } from "./context/galleryProvider";
import "@/styles/components/gallery.css";

type GalleryRootProps = {
    children?: React.ReactNode,
    getNextData: (currentCursor: number) => Promise<GalleryUploadedMedia[]>,
    className?: string
}

export function GalleryRoot(props: Readonly<GalleryRootProps>) {
    return <div className={["gallery", props.className ?? ""].join(" ")}>
        <GalleryProvider getNextData={props.getNextData}>
            {props.children}
        </GalleryProvider>
    </div>;
}