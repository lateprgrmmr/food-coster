import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const appApi = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5521', prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    } }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
        }),
        register: builder.mutation({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = appApi;