import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import streamsReducer from './slices/streamsSlice';
import chatReducer from './slices/chatSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    streams: streamsReducer,
    chat: chatReducer
  }
});

export default store;
