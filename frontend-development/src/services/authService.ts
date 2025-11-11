export interface User {
  id: string;
  username: string;
  name: string;
  role: 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin' | 'ITSpecialist';
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Dummy users database
export const dummyUsers: Array<User & { password: string }> = [
  // BOD Account
  {
    id: 'U001',
    username: 'bod',
    password: 'bod123',
    name: 'Director',
    role: 'BOD',
    email: 'bod@dskglobal.com',
  },
  // Admin Account
  {
    id: 'U002',
    username: 'admin',
    password: 'admin123',
    name: 'Admin',
    role: 'Admin',
    email: 'admin@dskglobal.com',
  },
  // BD Content Creators
  {
    id: 'U003',
    username: 'sarah',
    password: 'sarah123',
    name: 'Sarah Wijaya',
    role: 'BD-Content',
    email: 'sarah@dskglobal.com',
  },
  {
    id: 'U004',
    username: 'tommy',
    password: 'tommy123',
    name: 'Tommy Budiman',
    role: 'BD-Content',
    email: 'tommy@dskglobal.com',
  },
  // BD Executives
  {
    id: 'U005',
    username: 'andi',
    password: 'andi123',
    name: 'Andi Wijaya',
    role: 'BD-Executive',
    email: 'andi@dskglobal.com',
  },
  {
    id: 'U006',
    username: 'rina',
    password: 'rina123',
    name: 'Rina Kusuma',
    role: 'BD-Executive',
    email: 'rina@dskglobal.com',
  },
  {
    id: 'U007',
    username: 'dedi',
    password: 'dedi123',
    name: 'Dedi Supriyanto',
    role: 'BD-Executive',
    email: 'dedi@dskglobal.com',
  },
  {
    id: 'U008',
    username: 'fitri',
    password: 'fitri123',
    name: 'Fitri Handayani',
    role: 'BD-Executive',
    email: 'fitri@dskglobal.com',
  },
  // Project Managers
  {
    id: 'U009',
    username: 'diana',
    password: 'diana123',
    name: 'Diana Putri',
    role: 'PM',
    email: 'diana@dskglobal.com',
  },
  {
    id: 'U010',
    username: 'eko',
    password: 'eko123',
    name: 'Eko Prasetyo',
    role: 'PM',
    email: 'eko@dskglobal.com',
  },
  {
    id: 'U011',
    username: 'farhan',
    password: 'farhan123',
    name: 'Farhan Rahman',
    role: 'PM',
    email: 'farhan@dskglobal.com',
  },
  {
    id: 'U012',
    username: 'gita',
    password: 'gita123',
    name: 'Gita Sari',
    role: 'PM',
    email: 'gita@dskglobal.com',
  },
  // IT Account
  {
    id: 'U013',
    username: 'it',
    password: 'it123',
    name: 'IT Specialist',
    role: 'ITSpecialist',
    email: 'it@dskglobal.com',
  },
];

const SESSION_KEY = 'erp_user_session';
const SESSION_EXPIRY_KEY = 'erp_session_expiry';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface SessionData {
  user: User;
  timestamp: number;
  rememberMe: boolean;
}

const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
  const base = envBase || 'http://localhost:3000';
  // normalisasi: hilangkan trailing slash
  return base.replace(/\/+$/, '');
};

export const authService = {
  // Login function with remember me support
  login: (credentials: LoginCredentials, rememberMe: boolean = false): User | null => {
    const user = dummyUsers.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      const { password, ...userWithoutPassword } = user;
      const sessionData: SessionData = {
        user: userWithoutPassword,
        timestamp: Date.now(),
        rememberMe
      };

      // Always use localStorage for session sharing across tabs
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      
      // Set expiry time based on remember me
      const expiryTime = Date.now() + (rememberMe ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      
      return userWithoutPassword;
    }

    return null;
  },

  // Logout function - clear localStorage and broadcast to other tabs
  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    
    // Broadcast logout event to other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: SESSION_KEY,
      oldValue: localStorage.getItem(SESSION_KEY),
      newValue: null,
      url: window.location.href,
      storageArea: localStorage
    }));
  },

  // Start Microsoft login by redirecting to backend
  loginWithMicrosoftStart: (): void => {
    const base = getApiBase();
    const url = `${base}/auth/login`;
    window.location.href = url;
  },

  // Finalize Microsoft login: call backend /me with credentials, store session locally
  finalizeMicrosoftLogin: async (): Promise<User | null> => {
    try {
      const base = getApiBase();
      const res = await fetch(`${base}/me`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      const beUser = data?.user;
      if (!beUser) return null;

      // Map roles array from backend -> pick primary role for current app model
      const roles: string[] = Array.isArray(beUser.roles) ? beUser.roles : [];
      // Urutan prioritas supaya redirect konsisten
      const priority: Array<User['role']> = [
        'BOD',
        'Admin',
        'ITSpecialist',
        'PM',
        'BD-Executive',
        'BD-Content'
      ];
      const normalized = roles.map(r => String(r));
      let primaryRole = priority.find(p => normalized.includes(p)) as User['role'] | undefined;
      if (!primaryRole) {
        // fallback aman jika role dari DB tidak cocok union type
        primaryRole = 'ITSpecialist';
      }

      const user: User = {
        id: String(beUser.userId ?? beUser.id ?? ''),
        username: beUser.email ?? beUser.name ?? '',
        name: beUser.name ?? '',
        role: primaryRole,
        email: beUser.email ?? ''
      };

      const sessionData: SessionData = {
        user,
        timestamp: Date.now(),
        rememberMe: true
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      const expiryTime = Date.now() + REMEMBER_ME_DURATION;
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      return user;
    } catch {
      return null;
    }
  },

  // Get current user from session with expiry check
  getCurrentUser: (): User | null => {
    const sessionData = localStorage.getItem(SESSION_KEY);
    const expiryTime = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (sessionData && expiryTime) {
      try {
        const expiry = parseInt(expiryTime);
        
        // Check if session expired
        if (Date.now() > expiry) {
          // Session expired, clear it
          authService.logout();
          return null;
        }

        const data: SessionData = JSON.parse(sessionData);
        
        // Update timestamp for activity tracking
        data.timestamp = Date.now();
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        
        // Extend expiry on activity (if not expired yet)
        const newExpiryTime = Date.now() + (data.rememberMe ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
        localStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());
        
        return data.user;
      } catch {
        // If parsing fails, clear session
        authService.logout();
        return null;
      }
    }
    
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  // Update user activity (call this on user actions to prevent timeout)
  updateActivity: (): void => {
    const user = authService.getCurrentUser();
    if (user) {
      // getCurrentUser already updates the timestamp, so just calling it is enough
    }
  },

  // Get session info
  getSessionInfo: (): { isRemembered: boolean; expiresIn: number } | null => {
    const sessionData = localStorage.getItem(SESSION_KEY);
    const expiryTime = localStorage.getItem(SESSION_EXPIRY_KEY);

    if (sessionData && expiryTime) {
      try {
        const data: SessionData = JSON.parse(sessionData);
        const expiry = parseInt(expiryTime);
        const expiresIn = expiry - Date.now();
        
        if (expiresIn > 0) {
          return { isRemembered: data.rememberMe, expiresIn };
        }
      } catch {
        return null;
      }
    }
    
    return null;
  }
};



