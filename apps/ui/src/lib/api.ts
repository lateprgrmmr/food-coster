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

export type Vendor = {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    contactId: string;
    contactFname: string;
    contactLname: string;
    contactEmail: string;
    contactPhone: string;
    contactTitle: string;
}

export type VendorInput = {
    name: string;
    description?: string;
    contactFname?: string;
    contactLname?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactTitle?: string;
}

export type Location = {
    id: string;
    name: string;
    address: string;
}

export type NewInvoiceInput = {
    vendorId: string;
    locationId: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: string;
    }[];
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
    tagTypes: ['Me', 'Vendor', 'Invoice'],
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
                email: string;
                role: string;
                organizationId: string;
                contactId: string;
                fname: string;
                lname: string;
                contactEmail: string;
                phone: string;
                title: string;
            }
        }, void>({
            query: () => '/me',
            providesTags: ['Me'],
        }),
        updateProfile: builder.mutation({
            query: (body) => ({
                url: '/me',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Me'],
        }),
        getInvoices: builder.query<InvoiceListItem[], void>({
            query: () => '/invoices',
            providesTags: ['Invoice'],
        }),
        getInvoice: builder.query<InvoiceDetail, string>({
            query: (id) => `/invoices/${id}`,
            providesTags: (_res, _err, id) => [{ type: 'Invoice', id }],
        }),
        createInvoice: builder.mutation<InvoiceDetail, NewInvoiceInput>({
            query: (body) => ({
                url: '/invoices',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Invoice'],
        }),
        getLocations: builder.query<Location[], void>({
            query: () => '/locations',
        }),
        getVendors: builder.query<Vendor[], void>({
            query: () => '/vendors',
            providesTags: ['Vendor'],
        }),
        getVendor: builder.query<Vendor, string>({
            query: (id) => `/vendors/${id}`,
            providesTags: (_res, _err, id) => [{ type: 'Vendor', id }],
        }),
        createVendor: builder.mutation<Vendor, VendorInput>({
            query: (body) => ({
                url: '/vendors',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Vendor'],
        }),
        updateVendor: builder.mutation<{ message: string }, VendorInput & { id: string }>({
            query: ({ id, ...body }) => ({
                url: `/vendors/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_res, _err, arg ) => ['Vendor', { type: 'Vendor', id: arg.id }],
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
    useUpdateProfileMutation,
    useGetVendorsQuery,
    useGetVendorQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useGetLocationsQuery,
    useCreateInvoiceMutation,
} = appApi;