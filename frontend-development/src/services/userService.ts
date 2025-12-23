// services/userService.ts

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

const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
  const base = envBase || 'http://localhost:3000';
  return base.replace(/\/+$/, '');
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('erp_auth_token') || null;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const userService = {
  // GET /users - Get all users
  getAllUsers: async (): Promise<BackendUser[]> => {
    const base = getApiBase();
    const response = await fetch(`${base}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
      throw new Error(error.message || 'Failed to fetch users');
    }

    const result: UsersResponse = await response.json();
    return result.data || [];
  },

  // GET /users/:id - Get user by ID
  getUserById: async (id: number): Promise<BackendUser> => {
    const base = getApiBase();
    const response = await fetch(`${base}/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
      throw new Error(error.message || 'Failed to fetch user');
    }

    const result: UserResponse = await response.json();
    return result.data;
  },

  // POST /users - Create new user
  createUser: async (payload: CreateUserPayload): Promise<BackendUser> => {
    const base = getApiBase();
    const response = await fetch(`${base}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create user' }));
      throw new Error(error.message || 'Failed to create user');
    }

    const result: UserResponse = await response.json();
    return result.data;
  },

  // PUT /users/:id - Update user
  updateUser: async (id: number, payload: UpdateUserPayload): Promise<void> => {
    const base = getApiBase();
    const response = await fetch(`${base}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
      throw new Error(error.message || 'Failed to update user');
    }
  },

  // DELETE /users/:id - Delete user
  deleteUser: async (id: number): Promise<void> => {
    const base = getApiBase();
    const response = await fetch(`${base}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // POST /users/:id/profile-image - Update profile image
  updateProfileImage: async (id: number, imageFile: File): Promise<{ profile_image_path: string; profile_image_url: string }> => {
    const base = getApiBase();
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${base}/users/${id}/profile-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile image' }));
      throw new Error(error.message || 'Failed to update profile image');
    }

    return await response.json();
  },
};

