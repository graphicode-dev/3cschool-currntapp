import {
    Group,
    GroupDetailsData,
    GroupSessionsData,
    groupsService,
} from "@/services/groupsService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface GroupsState {
  groups: Group[];
  groupDetails: GroupDetailsData | null;
  groupSessions: GroupSessionsData | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingSessions: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  groupDetails: null,
  groupSessions: null,
  isLoading: false,
  isLoadingDetails: false,
  isLoadingSessions: false,
  error: null,
};

// Async thunk to fetch groups
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupsService.getGroups();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch groups");
    }
  },
);

// Async thunk to fetch group details (teacher or students based on user role)
export const fetchGroupDetails = createAsyncThunk(
  "groups/fetchGroupDetails",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await groupsService.getGroupDetails(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch group details");
    }
  },
);

// Async thunk to fetch group sessions
export const fetchGroupSessions = createAsyncThunk(
  "groups/fetchGroupSessions",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await groupsService.getGroupSessions(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch group sessions");
    }
  },
);

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGroupDetails: (state) => {
      state.groupDetails = null;
    },
    clearGroupSessions: (state) => {
      state.groupSessions = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload || [];
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch group details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.groupDetails = action.payload || null;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload as string;
      })
      // Fetch group sessions
      .addCase(fetchGroupSessions.pending, (state) => {
        state.isLoadingSessions = true;
        state.error = null;
      })
      .addCase(fetchGroupSessions.fulfilled, (state, action) => {
        state.isLoadingSessions = false;
        state.groupSessions = action.payload || null;
      })
      .addCase(fetchGroupSessions.rejected, (state, action) => {
        state.isLoadingSessions = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearGroupDetails, clearGroupSessions } =
  groupsSlice.actions;
export default groupsSlice.reducer;
