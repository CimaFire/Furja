import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    reactions: [],
    viewers: 0,
    isLoading: false
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Keep only last 100 messages
      if (state.messages.length > 100) {
        state.messages.shift();
      }
    },
    addReaction: (state, action) => {
      state.reactions.push(action.payload);
      // Keep only last 50 reactions
      if (state.reactions.length > 50) {
        state.reactions.shift();
      }
    },
    setViewers: (state, action) => {
      state.viewers = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.reactions = [];
    }
  }
});

export const { addMessage, addReaction, setViewers, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
