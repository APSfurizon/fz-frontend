import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { lastItem } from "@/lib/utils/collections";
import { useVirtualizer } from "@tanstack/react-virtual";
import { throttle } from "lodash";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useResizeObserver from "../hooks/useResizeObserver";
import { useGallery } from "./context/galleryProvider";
import { useGallerySelection } from "./context/gallerySelectionProvider";
import { useGalleryView } from "./context/galleryViewProvider";
import GalleryMedia from "./galleryMedia";

const BREAKPOINT = {
  xs: 400,
  sm: 700,
  lg: 1024,
};

const ITEM_RATIO = 1;

export default function GalleryVirtualizedGrid() {
  const { medias, ended, getNextData, galleryLoading } = useGallery();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { openMedia } = useGalleryView();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { selectedIds, selectionEnabled, select } = useGallerySelection();
  const t = useTranslations();

  // Grid rendering logic
  const sortFn = (a: [number, GalleryUploadedMedia], b: [number, GalleryUploadedMedia]) => b[0] - a[0];
  const sortedMedias = useMemo(() => Array.from(medias.entries()).sort(sortFn), [medias, sortFn]);

  const [columns, setColumns] = useState(4);
  const [gap, setGap] = useState({
    x: 10,
    y: 10,
  });
  const rowCount = useMemo(() => Math.ceil(medias.size / columns), [columns, medias]);

  const [itemSize, setItemSize] = useState({
    width: 0,
    height: 0,
  });

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const listOffsetRef = useRef(0);
  const { width: containerWidth } = useResizeObserver(gridContainerRef);
  useLayoutEffect(() => {
    listOffsetRef.current = gridContainerRef.current?.offsetTop ?? 0;
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => itemSize.height + gap.y,
    overscan: 3,
    getScrollElement: () => (typeof document !== "undefined" ? document.body : null),
    scrollMargin: listOffsetRef.current,
    onChange: (instance) => {
      const items = instance.getVirtualItems();

      if (!items.length) return;

      const last = items[items.length - 1];

      if (last.index >= rowCount - 3 && !galleryLoading && !ended) {
        // TODO must handle error?
        getNextData().catch(() => void 0);
      }
    },
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [itemSize.height, columns]);

  const getItemGap = (width: number) => {
    if (width <= BREAKPOINT.xs) {
      return {
        x: 5,
        y: 5,
      };
    }

    if (width <= BREAKPOINT.sm) {
      return {
        x: 7.5,
        y: 7.5,
      };
    }

    return {
      x: 10,
      y: 10,
    };
  };

  const getColumnsCount = (width: number) => {
    if (width <= BREAKPOINT.xs) {
      return 3;
    }

    if (width <= BREAKPOINT.sm) {
      return 4;
    }

    return 5;
  };

  const getItemWidth = (width: number, columns: number, gapX: number) => {
    return Math.floor((width - (columns - 1) * gapX) / columns);
  };

  const getItemHeight = (width: number, itemWidth: number) => {
    if (width >= BREAKPOINT.sm) {
      return itemWidth / ITEM_RATIO;
    }

    return itemWidth;
  };

  const handleResize = throttle(() => {
    const gap = getItemGap(containerWidth);
    const column = getColumnsCount(containerWidth);
    const itemWidth = getItemWidth(containerWidth, column, gap.x);
    const itemHeight = getItemHeight(containerWidth, itemWidth);

    setGap(gap);
    setColumns(column);
    setItemSize({
      width: itemWidth,
      height: itemHeight,
    });
  }, 200);

  useEffect(() => {
    if (!containerWidth) {
      return;
    }

    handleResize();
  }, [containerWidth]);

  const handleSelect = (id: number, selected: boolean, shift: boolean) => {
    const mediaIdsToSelect: number[] = [];
    const startId = lastItem(selectedIds.keys());
    if (shift && startId) {
      const startIndex = sortedMedias.findIndex((tuple) => tuple[0] === startId);
      const endIndex = sortedMedias.findIndex((tuple) => tuple[0] === id);
      if (startIndex >= 0 && endIndex >= 0) {
        const minIndex = Math.min(startIndex, endIndex);
        const maxIndex = Math.max(startIndex, endIndex) + 1;
        const toSelect = sortedMedias.slice(minIndex, maxIndex).map((tuple) => tuple[0]);
        if (startIndex > endIndex) {
          toSelect.reverse();
        }
        mediaIdsToSelect.push(...toSelect);
      }
    } else {
      mediaIdsToSelect.push(id);
    }
    //const allMediasSelected
    select(mediaIdsToSelect, selected);
  };

  const keyEffect = (e: KeyboardEvent) => {
    if (selectionEnabled && e.ctrlKey) {
      if (e.key === "a") {
        select(
          sortedMedias.slice(0, sortedMedias.length).map((tuple) => tuple[0]),
          true
        );
        e.preventDefault();
      } else if (e.key === "d") {
        select(
          sortedMedias.slice(0, sortedMedias.length).map((tuple) => tuple[0]),
          false
        );
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", keyEffect);
    return () => window.removeEventListener("keydown", keyEffect);
  }, [sortedMedias]);

  return (
    <div className="gallery__grid__container" ref={gridContainerRef}>
      <div
        className="gallery__grid"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * columns;
          const rowItems = sortedMedias.slice(startIdx, startIdx + columns);
          return (
            <div
              className="horizontal-list"
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: `${virtualRow.start - listOffsetRef.current}px`,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                //transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowItems.map(([id, media], index) => (
                <GalleryMedia
                  key={id}
                  source={media}
                  checkbox={selectionEnabled}
                  onSelect={handleSelect}
                  onClick={(m) => openMedia(m.id)}
                  selected={selectedIds.has(id)}
                  width={itemSize.width}
                  height={itemSize.height}
                  style={{
                    width: itemSize.width,
                    height: itemSize.height,
                    left: index * (itemSize.width + gap.x),
                    outline: lastItem(selectedIds.keys()) == id ? "3px dashed var(--highlight)" : "none",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
      {ended && (
        <div className="gallery__grid__container__bottom align-center">
          <span aria-label={t("components.gallery.grid.end_label")} className="descriptive medium">
            {t("components.gallery.grid.end_message")}
          </span>
          <br />
          <Image alt="" width={100} height={100} src={"/images/chibi/furizonchibi-social.png"} />
        </div>
      )}
    </div>
  );
}
