export interface PendingUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password: string; // In real app, this should be hashed
  createdAt: string;
}

const PENDING_USERS_KEY = 'erp_pending_users';

export const pendingUsersService = {
  // Get all pending users
  getPendingUsers: (): PendingUser[] => {
    const stored = localStorage.getItem(PENDING_USERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  // Add new pending user (from registration)
  addPendingUser: (user: Omit<PendingUser, 'id' | 'createdAt'>): PendingUser => {
    const pendingUsers = pendingUsersService.getPendingUsers();
    const newUser: PendingUser = {
      ...user,
      id: `P${String(pendingUsers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedUsers = [...pendingUsers, newUser];
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(updatedUsers));
    return newUser;
  },

  // Remove pending user (after role assignment)
  removePendingUser: (id: string): void => {
    const pendingUsers = pendingUsersService.getPendingUsers();
    const updatedUsers = pendingUsers.filter(u => u.id !== id);
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(updatedUsers));
  },

  // Check if username or email already exists
  checkExists: (username: string, email: string): boolean => {
    const pendingUsers = pendingUsersService.getPendingUsers();
    return pendingUsers.some(u => u.username === username || u.email === email);
  },
};

