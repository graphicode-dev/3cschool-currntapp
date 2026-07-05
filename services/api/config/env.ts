/**
 * API Environment Configuration
 * Single source of truth for API-related configuration values
 */

import Constants from "expo-constants";

export const API_CONFIG = {
    BASE_URL: Constants.expoConfig?.extra?.apiUrl ?? "https://3cschool.net/api",
    TIMEOUT: 30000,
    PROJECT_NAME: Constants.expoConfig?.extra?.projectName ?? "3cschool",
    ENV_MODE: Constants.expoConfig?.extra?.envMode ?? "production",
    AUTH_COOKIE_EXPIRES_DAYS:
        Constants.expoConfig?.extra?.auth?.cookieExpiresDays ?? "7",
    TOKEN_KEY: Constants.expoConfig?.extra?.auth?.tokenKey ?? "3cschool_token",
    USER_KEY: Constants.expoConfig?.extra?.auth?.userKey ?? "auth_user",
} as const;

export type ApiConfig = typeof API_CONFIG;
