import { createContext } from "react";

interface PullToRefreshContextValue {
    refreshing: boolean;
    onRefresh: () => Promise<void>;
}

export const PullToRefreshContext = createContext<PullToRefreshContextValue>({
    refreshing: false,
    onRefresh: async () => {},
});
