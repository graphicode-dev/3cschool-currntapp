/**
 * QueryClient Configuration
 *
 * Centralized TanStack Query v5 client configuration with:
 * - Sensible defaults for caching and retries
 * - Global error handling for mutations (toast notifications)
 * - Query errors handled inline by components
 *
 * @example
 * ```ts
 * // Query errors are shown inline
 * const { data, error } = useQuery({ queryKey: ['items'], queryFn: fetchItems });
 * if (error) return <ErrorMessage error={error} />;
 *
 * // Mutation errors trigger toast automatically
 * const mutation = useMutation({
 *     mutationFn: createItem,
 *     // onError is handled globally, but can be overridden
 * });
 * ```
 */

import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

/**
 * Time constants for cache configuration
 */
const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

/**
 * Default options for all queries
 *
 * - staleTime: Data is fresh for 5 minutes
 * - gcTime: Garbage collect after 10 minutes
 * - retry: Retry failed queries 3 times with exponential backoff
 * - refetchOnWindowFocus: Disabled to prevent unexpected refetches
 */
const queryDefaults: DefaultOptions["queries"] = {
    staleTime: FIVE_MINUTES,
    gcTime: TEN_MINUTES,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
};

/**
 * Default options for all mutations
 *
 * - retry: No retries for mutations (they should be idempotent)
 * - Error handling is done globally via onError callback
 */
const mutationDefaults: DefaultOptions["mutations"] = {
    retry: false,
};

/**
 * Create the QueryClient with configured defaults
 */
export const createQueryClient = (): QueryClient => {
    return new QueryClient({
        defaultOptions: {
            queries: queryDefaults,
            mutations: mutationDefaults,
        },
    });
};

/**
 * Singleton QueryClient instance
 *
 * Use this in the QueryProvider. For testing, create a new instance
 * using createQueryClient().
 */
export const queryClient = createQueryClient();

/**
 * Query key factory helpers
 *
 * Use these to create consistent query keys across the app.
 *
 * @example
 * ```ts
 * const keys = createQueryKeyFactory('users');
 * keys.all();           // ['users']
 * keys.lists();         // ['users', 'list']
 * keys.list({ page: 1 }); // ['users', 'list', { page: 1 }]
 * keys.details();       // ['users', 'detail']
 * keys.detail(1);       // ['users', 'detail', 1]
 * ```
 */
export const createQueryKeyFactory = <T extends string>(entity: T) => ({
    all: () => [entity] as const,
    lists: () => [entity, "list"] as const,
    list: (params?: Record<string, unknown>) =>
        params
            ? ([entity, "list", params] as const)
            : ([entity, "list"] as const),
    details: () => [entity, "detail"] as const,
    detail: (id: string | number) => [entity, "detail", id] as const,
});

/**
 * Type for query key factory
 */
export type QueryKeyFactory<T extends string> = ReturnType<
    typeof createQueryKeyFactory<T>
>;

export default queryClient;
