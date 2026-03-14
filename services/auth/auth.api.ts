import { api } from "../api/client";
import type { LoginData, UpdateProfileRequest, User } from "./auth.types";

export const authApi = {
    login: async (credentials: LoginData): Promise<User> => {
        const res = await api.post("/login", credentials);

        // If the API call failed, the error will be in res.error
        // The HTTP client already handles error transformation properly
        if (!res.success) {
            throw new Error(res.message);
        }

        // Extract user from successful response
        const responseData = res.data as any;
        const user = responseData?.data?.token
            ? responseData.data
            : responseData;

        if (!user?.token) {
            throw new Error("Invalid auth response - no token found");
        }

        return user as User;
    },

    logout: async () => {
        const res = await api.post("/logout");
        if (!res.success) {
            throw new Error(res.message);
        }
        return res.data;
    },

    profile: async (): Promise<User> => {
        const res = await api.get<{ data: User }>("/profile");
        if (!res.success) {
            throw new Error(res.message);
        }

        const responseData = res?.data?.data as User;

        // console.log(
        //     "User Responseeee: ",
        //     JSON.stringify(responseData, null, 2),
        // );

        return responseData;
    },

    updateProfile: async (payload: UpdateProfileRequest): Promise<User> => {
        const formData = new FormData();

        if (payload.full_name !== undefined) {
            formData.append("full_name", payload.full_name);
        }
        if (payload.email !== undefined) {
            formData.append("email", payload.email);
        }
        if (payload.mobile !== undefined) {
            formData.append("mobile", payload.mobile);
        }
        if (payload.address !== undefined) {
            formData.append("address", payload.address);
        }
        if (payload.avatar !== undefined) {
            // expo-image-picker returns a URI; build a file object for FormData
            const uriParts = payload.avatar.split(".");
            const fileType = uriParts[uriParts.length - 1];
            formData.append("avatar", {
                uri: payload.avatar,
                name: `avatar.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        // Laravel / standard APIs expect POST + _method=PUT for file uploads
        formData.append("_method", "PUT");

        const res = await api.post<any>("/profile", formData, {
            meta: { multipart: true },
        });

        if (!res.success) {
            throw new Error(res.message);
        }

        const responseData = res.data as any;
        const user = responseData?.data ?? responseData;

        return user as User;
    },
};
