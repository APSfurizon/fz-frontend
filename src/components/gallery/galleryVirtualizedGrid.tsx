import { throttle } from "lodash";
import { useGallery } from "./context/galleryProvider";
import { useGallerySelection } from "./context/gallerySelectionProvider";
import { useGalleryView } from "./context/galleryViewProvider";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import useResizeObserver from "../hooks/useResizeObserver";
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual";
import GalleryMedia from "./galleryMedia";
import Image from "next/image";
import { useTranslations } from "next-intl";

const BREAKPOINT = {
  xs: 400,
  sm: 700,
  lg: 1024,
};

const ITEM_RATIO = 1;

export default function GalleryVirtualizedGrid() {
  const { medias, ended, getNextData, onRefresh, galleryLoading } = useGallery();
  const { openMedia } = useGalleryView();
  const { selectedIds, selectionEnabled, setSelectionEnabled, select, clearSelection } = useGallerySelection();
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
        getNextData();
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
                  onSelect={select}
                  onClick={(m) => openMedia(m.id)}
                  selected={selectedIds.has(id)}
                  width={itemSize.width}
                  height={itemSize.height}
                  style={{
                    width: itemSize.width,
                    height: itemSize.height,
                    left: index * (itemSize.width + gap.x),
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
