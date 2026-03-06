/**
 * API Environment Configuration
 * Single source of truth for API-related configuration values
 */

import Constants from "expo-constants";

export const API_CONFIG = {
    BASE_URL: Constants.expoConfig?.extra?.apiUrl,
    TIMEOUT: 30000,
    PROJECT_NAME: Constants.expoConfig?.extra?.projectName,
    ENV_MODE: Constants.expoConfig?.extra?.envMode,
    AUTH_COOKIE_EXPIRES_DAYS:
        Constants.expoConfig?.extra?.auth?.cookieExpiresDays,
    TOKEN_KEY: Constants.expoConfig?.extra?.auth?.tokenKey,
    USER_KEY: Constants.expoConfig?.extra?.auth?.userKey,
} as const;

export type ApiConfig = typeof API_CONFIG;
