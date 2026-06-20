import { createSlice } from '@reduxjs/toolkit';

const streamsSlice = createSlice({
  name: 'streams',
  initialState: {
    streams: [],
    currentStream: null,
    isLoading: false,
    error: null
  },
  reducers: {
    setStreams: (state, action) => {
      state.streams = action.payload;
    },
    setCurrentStream: (state, action) => {
      state.currentStream = action.payload;
    },
    addStream: (state, action) => {
      state.streams.push(action.payload);
    },
    updateStream: (state, action) => {
      const index = state.streams.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.streams[index] = action.payload;
      }
    },
    removeStream: (state, action) => {
      state.streams = state.streams.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setStreams,
  setCurrentStream,
  addStream,
  updateStream,
  removeStream,
  setLoading,
  setError
} = streamsSlice.actions;
export default streamsSlice.reducer;
