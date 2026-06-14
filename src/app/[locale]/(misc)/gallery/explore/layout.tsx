"use client";
import { ExploreFilterDataProvider } from "./_components/exploreFilterDataProvider";
import { ExploreNavigationProvider } from "./_components/exploreNavigationProvider";
import { ExploreProvider } from "./_components/exploreProvider";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ExploreNavigationProvider>
      <ExploreFilterDataProvider>
        <ExploreProvider>{children}</ExploreProvider>
      </ExploreFilterDataProvider>
    </ExploreNavigationProvider>
  );
}
