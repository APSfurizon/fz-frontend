import { BadgeStatusApiResponse } from "@/lib/api/badge/badge";
import { createContext, useContext } from "react";

interface BadgeContextType {
  badgeData: BadgeStatusApiResponse | null | undefined;
  isEditExpired: boolean | null | undefined;
}

const BadgeContext = createContext<BadgeContextType>({} as BadgeContextType);

type BadgeProviderProps = {
  children: React.ReactNode;
  badgeData: BadgeStatusApiResponse | null | undefined;
  isEditExpired: boolean | null | undefined;
};
export function BadgeProvider(props: Readonly<BadgeProviderProps>) {
  return (
    <BadgeContext.Provider
      value={{
        badgeData: props.badgeData,
        isEditExpired: props.isEditExpired,
      }}
    >
      {props.children}
    </BadgeContext.Provider>
  );
}

export const useBadge = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("useBadge must be used within a HeaderProvider");
  }
  return context;
};
