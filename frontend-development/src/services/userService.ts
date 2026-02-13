// services/userService.ts

import api from './api';

export interface BackendUser {
  id: number;
  full_name: string;
  email: string;
  username: string;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  is_active: boolean;
  created_at?: string | null;
  last_login_at?: string | null;
  role: {
    id: number;
    code: string;
    name: string;
  };
  departments: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  username: string;
  password: string;
  role_code: string;
  is_active?: boolean;
  departments?: string[]; // array of department codes
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  username?: string;
  password?: string;
  role_code?: string;
  is_active?: boolean;
  departments?: string[]; // array of department codes
}

export interface UsersResponse {
  data: BackendUser[];
}

export interface UserResponse {
  data: BackendUser;
}

export interface MessageResponse {
  message: string;
}


export const userService = {
  // GET /users - Get all users
  getAllUsers: async (): Promise<BackendUser[]> => {
    try {
      const response = await api.get<UsersResponse>('/users');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  // GET /users/:id - Get user by ID
  getUserById: async (id: number): Promise<BackendUser> => {
    try {
      const response = await api.get<UserResponse>(`/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  },

  // POST /users - Create new user
  createUser: async (payload: CreateUserPayload): Promise<BackendUser> => {
    try {
      const response = await api.post<UserResponse>('/users', payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  },

  // PUT /users/:id - Update user
  updateUser: async (id: number, payload: UpdateUserPayload): Promise<void> => {
    try {
      await api.put(`/users/${id}`, payload);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // DELETE /users/:id - Delete user
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // POST /users/:id/profile-image - Update profile image
  updateProfileImage: async (id: number, imageFile: File): Promise<{ profile_image_path: string; profile_image_url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post<{ profile_image_path: string; profile_image_url: string }>(
        `/users/${id}/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile image');
    }
  },
};

