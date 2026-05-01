import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import streamsReducer from './slices/streamsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    streams: streamsReducer
  }
});

export default store;
