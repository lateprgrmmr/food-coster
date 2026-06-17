import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type InvoiceListItem = {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    status: string;
    vendorName: string;
    locationName: string;
    itemCount: number;
    total: string;
}

export type InvoiceItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    subCategoryName: string;
}

export type InvoiceDetail = {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    status: string;
    vendorName: string;
    locationName: string;
    items: InvoiceItem[];
}

export const appApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5521', prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
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
        forgotPassword: builder.mutation({
            query: (body) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body,
            }),
        }),
        resetPassword: builder.mutation({
            query: (body) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body,
            }),
        }),
        getMe: builder.query<{
            user: {
                id: string;
                organizationId: string;
                email: string;
                role: string;
            }
        }, void>({
            query: () => '/me',
        }),
        getInvoices: builder.query<InvoiceListItem[], void>({
            query: () => '/invoices',
        }),
        getInvoice: builder.query<InvoiceDetail, string>({
            query: (id) => `/invoices/${id}`,
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetMeQuery,
    useGetInvoicesQuery,
    useGetInvoiceQuery,
} = appApi;