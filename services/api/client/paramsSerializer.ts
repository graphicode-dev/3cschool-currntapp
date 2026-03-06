/**
 * Advanced Params Serializer
 *
 * Serializes complex query parameters including:
 * - Nested objects: filters[status]=active
 * - Arrays: ids[]=1&ids[]=2
 * - Sort objects: sort[field]=name&sort[order]=asc
 * - Pagination: page=1&per_page=10
 * - Date ranges: date[from]=2024-01-01&date[to]=2024-12-31
 *
 * @example
 * ```ts
 * serializeParams({
 *     page: 1,
 *     filters: { status: 'active', types: ['a', 'b'] },
 *     sort: { field: 'name', order: 'asc' }
 * });
 * // Returns: "page=1&filters[status]=active&filters[types][]=a&filters[types][]=b&sort[field]=name&sort[order]=asc"
 * ```
 */

export type ParamValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | Date
    | ParamValue[]
    | { [key: string]: ParamValue };

export interface SerializerOptions {
    /**
     * Array format: 'brackets' for key[]=value, 'indices' for key[0]=value, 'repeat' for key=value&key=value
     * @default 'brackets'
     */
    arrayFormat?: "brackets" | "indices" | "repeat";

    /**
     * Whether to encode keys and values
     * @default true
     */
    encode?: boolean;

    /**
     * Whether to skip null/undefined values
     * @default true
     */
    skipNull?: boolean;

    /**
     * Whether to skip empty strings
     * @default true
     */
    skipEmpty?: boolean;
}

const defaultOptions: Required<SerializerOptions> = {
    arrayFormat: "brackets",
    encode: true,
    skipNull: true,
    skipEmpty: true,
};

/**
 * Serialize a single value with proper encoding
 */
const encodeValue = (
    value: string | number | boolean,
    encode: boolean
): string => {
    const stringValue = String(value);
    return encode ? encodeURIComponent(stringValue) : stringValue;
};

/**
 * Serialize a key with proper encoding
 */
const encodeKey = (key: string, encode: boolean): string => {
    return encode ? encodeURIComponent(key) : key;
};

/**
 * Build a nested key path like "filters[status]" or "filters[types][]"
 */
const buildKey = (
    prefix: string,
    key: string,
    isArrayItem: boolean,
    arrayFormat: SerializerOptions["arrayFormat"],
    index?: number
): string => {
    if (!prefix) {
        return key;
    }

    if (isArrayItem) {
        switch (arrayFormat) {
            case "indices":
                return `${prefix}[${index}]`;
            case "repeat":
                return prefix;
            case "brackets":
            default:
                return `${prefix}[]`;
        }
    }

    return `${prefix}[${key}]`;
};

/**
 * Recursively serialize parameters with circular reference protection
 */
const serializeValue = (
    key: string,
    value: ParamValue,
    options: Required<SerializerOptions>,
    parts: string[],
    seen: WeakSet<object> = new WeakSet()
): void => {
    // Skip null/undefined
    if (value === null || value === undefined) {
        if (!options.skipNull) {
            parts.push(`${encodeKey(key, options.encode)}=`);
        }
        return;
    }

    // Skip empty strings
    if (value === "" && options.skipEmpty) {
        return;
    }

    // Handle Date objects
    if (value instanceof Date) {
        parts.push(
            `${encodeKey(key, options.encode)}=${encodeValue(value.toISOString(), options.encode)}`
        );
        return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            const arrayKey = buildKey(
                key,
                "",
                true,
                options.arrayFormat,
                index
            );
            serializeValue(arrayKey, item, options, parts, seen);
        });
        return;
    }

    // Handle objects (nested params)
    if (typeof value === "object") {
        // Circular reference protection
        if (seen.has(value)) {
            console.warn(
                `[paramsSerializer] Circular reference detected for key "${key}", skipping`
            );
            return;
        }
        seen.add(value);

        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            const fullKey = buildKey(
                key,
                nestedKey,
                false,
                options.arrayFormat
            );
            serializeValue(fullKey, nestedValue, options, parts, seen);
        });
        return;
    }

    // Handle primitives (string, number, boolean)
    parts.push(
        `${encodeKey(key, options.encode)}=${encodeValue(value, options.encode)}`
    );
};

/**
 * Serialize an object of parameters into a query string
 *
 * @param params - The parameters object to serialize
 * @param options - Serialization options
 * @returns The serialized query string (without leading ?)
 */
export const serializeParams = (
    params?: Record<string, ParamValue>,
    options?: SerializerOptions
): string => {
    if (!params || Object.keys(params).length === 0) {
        return "";
    }

    const mergedOptions = { ...defaultOptions, ...options };
    const parts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
        serializeValue(key, value, mergedOptions, parts);
    });

    return parts.join("&");
};

/**
 * Create an Axios-compatible params serializer function
 */
export const createParamsSerializer = (options?: SerializerOptions) => {
    return (params: Record<string, ParamValue>): string => {
        return serializeParams(params, options);
    };
};

/**
 * Standard pagination params interface
 */
export interface PaginationParams {
    page?: number;
    perPage?: number;
    per_page?: number;
}

/**
 * Standard sort params interface
 */
export interface SortParams {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    sort?: {
        field?: string;
        order?: "asc" | "desc";
    };
}

/**
 * Standard filter params interface (generic)
 */
export interface FilterParams<T = Record<string, ParamValue>> {
    filters?: T;
    search?: string;
}

/**
 * Combined query params type for list endpoints
 */
export type ListQueryParams<TFilters = Record<string, ParamValue>> =
    PaginationParams & SortParams & FilterParams<TFilters>;
