import { useExploreFilterData } from "./exploreFilterDataProvider";

export default function GalleryBanner() {
    const { currentFilterData, loading } = useExploreFilterData();
}