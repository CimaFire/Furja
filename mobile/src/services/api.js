import {
  createApiClient,
  createAuthService,
  createStreamsService
} from '../../../shared/services/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = createApiClient(API_BASE_URL);

export const authService = createAuthService(api);
export const streamsService = createStreamsService(api);

export default api;
