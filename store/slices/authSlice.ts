import { api, ApiError } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  student_code: string;
  username: string;
  full_name: string;
  role_name: string;
  job_level: string | null;
  grade_id: number;
  current_course_id: number;
  next_course_id: number;
  current_extra_course_id: number | null;
  next_extra_course_id: number | null;
  organ_id: number | null;
  mobile: string;
  email: string;
  age: number;
  parent_number: string | null;
  parent_name: string | null;
  school: string;
  age_group_id: number;
  country: string;
  city: string;
  note: string | null;
  session_quota: number;
  stage: string;
  assigned_at: string | null;
  assigned_to_sales_upgrade_user_id: number | null;
  bio: string | null;
  logged_count: number;
  verified: number;
  financial_approval: number;
  installment_approval: number;
  enable_installments: number;
  disable_cashback: number;
  enable_registration_bonus: number;
  registration_bonus_amount: number | null;
  avatar: string | null;
  avatar_settings: string;
  cover_img: string | null;
  profile_video: string | null;
  profile_secondary_image: string | null;
  headline: string | null;
  about: string | null;
  address: string | null;
  country_id: number | null;
  province_id: number | null;
  city_id: number | null;
  district_id: number | null;
  location: unknown[];
  level_of_training: string | null;
  meeting_type: string;
  status: string;
  access_content: number;
  enable_ai_content: number;
  language: string;
  currency: string | null;
  timezone: string | null;
  theme_color_mode: string;
  newsletter: number;
  public_message: number;
  enable_profile_statistics: number;
  identity_scan: string | null;
  certificate: string | null;
  affiliate: number;
  can_create_store: number;
  ban: number;
  ban_start_at: string | null;
  ban_end_at: string | null;
  offline: number;
  offline_message: string | null;
  created_by_id: number;
  updated_by_id: number | null;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

// Async thunk for login
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<User & { token: string }>(
      "/login",
      credentials,
    );

    if (response.code === 200 && response.data.token) {
      const { token, ...userData } = response.data;

      // Save to storage
      api.setToken(token);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));

      return { user: response.data, token };
    }

    return rejectWithValue("Login failed");
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || "An error occurred");
  }
});

// Async thunk for getting profile
export const getProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<User>("/auth/profile");

      if (response.code === 200) {
        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      }

      return rejectWithValue("Failed to get profile");
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "An error occurred");
    }
  },
);

// Async thunk for restoring auth state from storage
export const restoreAuth = createAsyncThunk<
  { user: User; token: string } | null,
  void,
  { rejectValue: string }
>("auth/restore", async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);

    if (token && userJson) {
      api.setToken(token);
      const user = JSON.parse(userJson) as User;
      return { user, token };
    }

    return null;
  } catch (error) {
    return rejectWithValue("Failed to restore auth state");
  }
});

// Async thunk for logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API
      await api.post("/logout", {});
    } catch (error) {
      // Continue with local logout even if API fails
      console.log("Logout API error:", error);
    } finally {
      // Always clear local storage
      api.setToken(null);
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to get profile";
      });

    // Restore Auth
    builder
      .addCase(restoreAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isLoading = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
