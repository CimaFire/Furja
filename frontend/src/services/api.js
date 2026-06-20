import {
  createApiClient,
  createAuthService,
  createStreamsService,
  createUsersService,
  createGiftsService,
  createPaymentsService,
  createAnalyticsService,
  createGamesService,
  createCurrencyService,
  createAgenciesService
} from '../../../shared/services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = createApiClient(API_BASE_URL, () => localStorage.getItem('token'));

export const authService = createAuthService(api);
export const streamsService = createStreamsService(api);
export const usersService = createUsersService(api);
export const giftsService = createGiftsService(api);
export const paymentsService = createPaymentsService(api);
export const analyticsService = createAnalyticsService(api);
export const gamesService = createGamesService(api);
export const currencyService = createCurrencyService(api);
export const agenciesService = createAgenciesService(api);

export default api;
