"use client"
import { ExploreNavigationProvider } from "./_components/exploreNavigationProvider";
import { ExploreProvider } from "./_components/exploreProvider";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <ExploreNavigationProvider>
        <ExploreProvider>
            {children}
        </ExploreProvider>
    </ExploreNavigationProvider>
}