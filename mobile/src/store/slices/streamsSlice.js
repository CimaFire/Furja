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
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setStreams, setCurrentStream, setLoading, setError } = streamsSlice.actions;
export default streamsSlice.reducer;
