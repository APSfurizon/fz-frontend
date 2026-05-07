"use client"
import { ExploreProvider } from "./_components/exploreProvider";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <ExploreProvider>
        {children}
    </ExploreProvider>
}