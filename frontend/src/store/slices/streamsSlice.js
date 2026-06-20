import { createStreamsSlice } from '../../../../shared/store/slices/streamsSlice';

const streamsSlice = createStreamsSlice();

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
