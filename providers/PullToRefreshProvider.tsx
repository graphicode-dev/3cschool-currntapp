import { PullToRefreshContext } from "@/contexts/pull-to-refresh-context";
import { ReactNode, useCallback, useState } from "react";

type RefetchFn = () => Promise<unknown> | unknown;

interface PullToRefreshProviderProps {
    children: ReactNode;
    refetches?: RefetchFn[];
    onRefreshComplete?: () => void;
    onRefreshError?: (error: unknown) => void;
}

export function PullToRefreshProvider({
    children,
    refetches = [],
    onRefreshComplete,
    onRefreshError,
}: PullToRefreshProviderProps) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        if (refetches.length === 0) return;
        setRefreshing(true);
        try {
            await Promise.all(refetches.map((fn) => fn()));
            onRefreshComplete?.();
        } catch (error) {
            onRefreshError?.(error);
        } finally {
            setRefreshing(false);
        }
    }, [refetches, onRefreshComplete, onRefreshError]);

    return (
        <PullToRefreshContext.Provider value={{ refreshing, onRefresh }}>
            {children}
        </PullToRefreshContext.Provider>
    );
}
