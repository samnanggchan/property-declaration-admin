import { apiSlice } from './apiSlice';

export interface UserItem {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  data: UserItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  avatar?: string;
  isActive?: boolean;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      UsersResponse,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        const qs = searchParams.toString();
        return `/users${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<UserItem, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<UserItem, CreateUserInput>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<
      UserItem,
      { id: string; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    uploadAvatar: builder.mutation<{ url: string; filename: string }, FormData>({
      query: (formData) => ({
        url: '/users/upload-avatar',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
} = usersApi;
