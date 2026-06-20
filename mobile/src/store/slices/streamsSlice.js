import { createStreamsSlice } from '../../../../shared/store/slices/streamsSlice';

const streamsSlice = createStreamsSlice();

export const { setStreams, setCurrentStream, setLoading, setError } = streamsSlice.actions;
export default streamsSlice.reducer;
