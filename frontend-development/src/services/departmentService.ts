// services/departmentService.ts

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

export const departmentService = {
  // GET /departments - Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const base = getApiBase();
    const response = await fetch(`${base}/departments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch departments' }));
      throw new Error(error.message || 'Failed to fetch departments');
    }

    const result: DepartmentsResponse = await response.json();
    return result.data || [];
  },

  // GET /departments/:id - Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const base = getApiBase();
    const response = await fetch(`${base}/departments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch department' }));
      throw new Error(error.message || 'Failed to fetch department');
    }

    const result: DepartmentResponse = await response.json();
    return result.data;
  },
};

