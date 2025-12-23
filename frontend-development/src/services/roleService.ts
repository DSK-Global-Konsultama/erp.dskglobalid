// services/roleService.ts

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RolesResponse {
  data: Role[];
}

export interface RoleResponse {
  data: Role;
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

export const roleService = {
  // GET /roles - Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const base = getApiBase();
    const response = await fetch(`${base}/roles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch roles' }));
      throw new Error(error.message || 'Failed to fetch roles');
    }

    const result: RolesResponse = await response.json();
    return result.data || [];
  },

  // GET /roles/:id - Get role by ID
  getRoleById: async (id: number): Promise<Role> => {
    const base = getApiBase();
    const response = await fetch(`${base}/roles/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch role' }));
      throw new Error(error.message || 'Failed to fetch role');
    }

    const result: RoleResponse = await response.json();
    return result.data;
  },
};

