import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";

type GallerySelectionProviderType = {
  selectedIds: Set<number>;
  setSelectedIds: Dispatch<SetStateAction<Set<number>>>;
  selectionEnabled: boolean;
  setSelectionEnabled: Dispatch<SetStateAction<boolean>>;
  select(id: number, selected: boolean): void;
  clearSelection(): void;
};

const GallerySelectionContext = createContext<GallerySelectionProviderType>(undefined as any);

type GallerySelectionProviderProps = {
  children?: React.ReactNode;
};

export function GallerySelectionProvider(props: Readonly<GallerySelectionProviderProps>) {
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const [selection, setSelection] = useState<Set<number>>(new Set());

  const select = useCallback((id: number, selected: boolean = true) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelection(new Set()), []);

  useEffect(() => {
    if (!selectionEnabled) {
      clearSelection();
    }
  }, [selectionEnabled]);

  return (
    <GallerySelectionContext.Provider
      value={{
        selectedIds: selection,
        setSelectedIds: setSelection,
        selectionEnabled,
        setSelectionEnabled,
        select,
        clearSelection,
      }}
    >
      {props.children}
    </GallerySelectionContext.Provider>
  );
}

export function useGallerySelection() {
  const context = useContext(GallerySelectionContext);
  if (!context) {
    throw new Error("useGallerySelection must be used within a GallerySelectionProvider");
  }
  return context;
}
