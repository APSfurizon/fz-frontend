import { useSyncExternalStore } from "react";

type WindowSize = {
    width: number;
    height: number;
};

const isBrowser = typeof window !== "undefined";

let snapshot: WindowSize = {
    width: isBrowser ? window.innerWidth : 0,
    height: isBrowser ? window.innerHeight : 0,
};

const listeners = new Set<() => void>();

let frame: number | null = null;

function emit() {
    if (!isBrowser) return;

    if (frame !== null) return;

    frame = requestAnimationFrame(() => {
        frame = null;

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (width === snapshot.width && height === snapshot.height) {
            return;
        }

        snapshot = { width, height };

        listeners.forEach((l) => l());
    });
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    if (listeners.size === 1 && isBrowser) {
        window.addEventListener("resize", emit);
    }

    return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && isBrowser) {
            window.removeEventListener("resize", emit);
        }
    };
}

function getSnapshot() {
    return snapshot;
}

function getServerSnapshot(): WindowSize {
    return { width: 0, height: 0 };
}

export function useWindowSize(): WindowSize {
    return useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );
}