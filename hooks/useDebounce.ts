import { useCallback, useEffect, useState } from "react";

/**
 * Debounce hook to delay the execution of a function
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounced callback hook
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
): T {
    const [debounceTimer, setDebounceTimer] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            const newTimer = setTimeout(() => {
                callback(...args);
            }, delay);

            setDebounceTimer(newTimer);
        },
        [callback, delay, debounceTimer],
    ) as T;

    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
}
