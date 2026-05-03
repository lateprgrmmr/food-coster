import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './lib/api';

export const store = configureStore({
    reducer: {
        [appApi.reducerPath]: appApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;