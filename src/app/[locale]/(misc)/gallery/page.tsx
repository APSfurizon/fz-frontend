import { redirect } from "next/navigation";

export default function GalleryPage() {
    return redirect("/gallery/explore", "replace");
}