// services/roleService.ts

import api from './api';

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


export const roleService = {
  // GET /roles - Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get<RolesResponse>('/roles');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch roles');
    }
  },

  // GET /roles/:id - Get role by ID
  getRoleById: async (id: number): Promise<Role> => {
    try {
      const response = await api.get<RoleResponse>(`/roles/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch role');
    }
  },
};

