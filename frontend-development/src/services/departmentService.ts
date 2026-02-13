// services/departmentService.ts

import api from './api';

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentsResponse {
  data: Department[];
}

export interface DepartmentResponse {
  data: Department;
}


export const departmentService = {
  // GET /departments - Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    try {
      const response = await api.get<DepartmentsResponse>('/departments');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch departments');
    }
  },

  // GET /departments/:id - Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    try {
      const response = await api.get<DepartmentResponse>(`/departments/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch department');
    }
  },
};

