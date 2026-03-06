import { useContext } from "react";
import { PullToRefreshContext } from "../contexts/pull-to-refresh-context";

export function usePullToRefresh() {
    return useContext(PullToRefreshContext);
}
