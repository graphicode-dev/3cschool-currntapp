const LOGGING_ENABLED = true;

export const logger = {
    log: (name: string, message: string, ...data: unknown[]) => {
        if (!LOGGING_ENABLED) return;
        console.log(
            `[${name}] ${message}`,
            ...data.map((d) => JSON.stringify(d, null, 2)),
        );
    },
    error: (name: string, message: string, ...data: unknown[]) => {
        if (!LOGGING_ENABLED) return;
        console.error(
            `[${name}] ${message}`,
            ...data.map((d) => JSON.stringify(d, null, 2)),
        );
    },
    warn: (name: string, message: string, ...data: unknown[]) => {
        if (!LOGGING_ENABLED) return;
        console.warn(
            `[${name}] ${message}`,
            ...data.map((d) => JSON.stringify(d, null, 2)),
        );
    },
};
