import { api, ApiResponse } from "./api";

interface PushTokenResponse {
    success: boolean;
}

export const notificationsService = {
    async savePushToken(
        token: string,
    ): Promise<ApiResponse<PushTokenResponse>> {
        return api.post<PushTokenResponse>("/expo-token", { token });
    },
};
