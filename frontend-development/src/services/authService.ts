export type UserRole =
  | 'CEO'
  | 'COO-Tax-Audit'
  | 'COO-Legal-TP-SR'
  | 'BD-MEO'
  | 'BD-Executive'
  | 'PM'
  | 'Admin'
  | 'ITSpecialist'
  | 'SuperAdmin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

type BackendRoleCode =
  | 'CEO'
  | 'COO'
  | 'PM'
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'IT'
  | 'IT_SPECIALIST'
  | 'BD_EXECUTIVE'
  | 'BD-EXECUTIVE'
  | 'BD EXECUTIVE'
  | 'BD_MEO'
  | 'BD-MEO'
  | 'BD MEO';

type BackendDepartment = {
  code?: string;
  name?: string;
};

type BackendUser = {
  id?: number | string;
  full_name?: string;
  email?: string;
  username?: string;
  profile_image_path?: string | null;
  profile_image_url?: string | null;
  role?: {
    code?: BackendRoleCode | string;
    name?: string;
  };
  departments?: BackendDepartment[];
};

type BackendLoginResponse = {
  message?: string;
  token: string;
  user: BackendUser;
};

const SESSION_KEY = 'erp_user_session';
const SESSION_EXPIRY_KEY = 'erp_session_expiry';
const TOKEN_KEY = 'erp_auth_token';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/** Demo accounts untuk development / preview (login tanpa backend). Password: demo123 */
const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'diana@dskglobal.com': {
    password: 'demo123',
    user: {
      id: 'U009',
      username: 'diana@dskglobal.com',
      name: 'Diana Putri',
      role: 'PM',
      email: 'diana@dskglobal.com',
    },
  },
  'diana.putri': {
    password: 'demo123',
    user: {
      id: 'U009',
      username: 'diana.putri',
      name: 'Diana Putri',
      role: 'PM',
      email: 'diana@dskglobal.com',
    },
  },
};

interface SessionData {
  user: User;
  token?: string;
  timestamp: number;
  rememberMe: boolean;
}

const getApiBase = (): string => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
  const base = envBase || 'http://localhost:3000';
  // normalisasi: hilangkan trailing slash
  return base.replace(/\/+$/, '');
};

const mapRoleCodeToUserRole = (
  roleCode: BackendRoleCode | string | undefined,
  departments: BackendDepartment[] = []
): UserRole => {
  const normalized = (roleCode || '').toUpperCase();

  if (normalized === 'CEO') return 'CEO';
  if (normalized === 'SUPERADMIN') return 'SuperAdmin';
  if (normalized === 'ADMIN') return 'Admin';
  if (normalized === 'PM') return 'PM';
  if (normalized === 'IT' || normalized === 'IT_SPECIALIST' || normalized === 'IT SPECIALIST')
    return 'ITSpecialist';
  if (
    normalized === 'BD_EXECUTIVE' ||
    normalized === 'BD-EXECUTIVE' ||
    normalized === 'BD EXECUTIVE'
  ) {
    return 'BD-Executive';
  }
  if (normalized === 'BD_MEO' || normalized === 'BD-MEO' || normalized === 'BD MEO') {
    return 'BD-MEO';
  }
  if (normalized === 'COO') {
    const deptCodes = departments.map((d) => (d.code || '').toUpperCase());
    const legalLike = ['LEGAL', 'TPDOC', 'SUSREP', 'TP', 'SR', 'TP-SR'];
    const isLegalSide = deptCodes.some((code) => legalLike.includes(code));
    return isLegalSide ? 'COO-Legal-TP-SR' : 'COO-Tax-Audit';
  }
  // Default fallback so UI still works even if new role appears
  return 'Admin';
};

const mapBackendUserToFrontend = (beUser: BackendUser): User => {
  const role = mapRoleCodeToUserRole(beUser.role?.code, beUser.departments);
  const fullName = beUser.full_name || beUser.username || beUser.email || '';
  return {
    id: String(beUser.id ?? ''),
    username: beUser.username || beUser.email || '',
    name: fullName,
    role,
    email: beUser.email || '',
    profile_image_path: beUser.profile_image_path ?? null,
    profile_image_url: beUser.profile_image_url ?? null,
  };
};

export const authService = {
  // Login function with remember me support (calls backend API; demo accounts skip API)
  login: async (credentials: LoginCredentials, rememberMe: boolean = false): Promise<User> => {
    const identifier = (credentials.username || '').trim().toLowerCase();
    const demo = DEMO_ACCOUNTS[identifier] || DEMO_ACCOUNTS[credentials.username?.trim() ?? ''];
    if (demo && demo.password === credentials.password) {
      const sessionData: SessionData = {
        user: demo.user,
        token: undefined,
        timestamp: Date.now(),
        rememberMe,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      const expiryTime = Date.now() + (rememberMe ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      return demo.user;
    }

    const base = getApiBase();

    let response: Response;
    try {
      response = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: credentials.username,
          password: credentials.password
        })
      });
    } catch (err) {
      console.error('[authService.login] Network error', err);
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    }

    let payload: BackendLoginResponse | null = null;
    try {
      payload = (await response.json()) as BackendLoginResponse;
    } catch (err) {
      console.error('[authService.login] Failed to parse response', err);
    }

    if (!response.ok) {
      const message = payload?.message || 'Username atau password salah';
      throw new Error(message);
    }

    if (!payload?.token || !payload?.user) {
      throw new Error('Respon login tidak lengkap dari server');
    }

    const user = mapBackendUserToFrontend(payload.user);

    const sessionData: SessionData = {
      user,
      token: payload.token,
      timestamp: Date.now(),
      rememberMe
    };

    // Always use localStorage for session sharing across tabs
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, payload.token);

    // Set expiry time based on remember me
    const expiryTime = Date.now() + (rememberMe ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());

    return user;
  },

  // Logout function - clear localStorage and broadcast to other tabs
  logout: (): void => {
    const oldValue = localStorage.getItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem(TOKEN_KEY);

    // Broadcast logout event to other tabs
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: SESSION_KEY,
        oldValue,
        newValue: null,
        url: window.location.href,
        storageArea: localStorage
      })
    );
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
        'SuperAdmin',
        'CEO',
        'COO-Tax-Audit',
        'COO-Legal-TP-SR',
        'Admin',
        'ITSpecialist',
        'PM',
        'BD-Executive',
        'BD-MEO'
      ];
      // Normalize roles: handle case sensitivity
      const normalized = roles.map((r) => {
        const roleStr = String(r).trim();
        return roleStr;
      });

      let primaryRole = priority.find((p) => normalized.includes(p)) as User['role'] | undefined;
      if (!primaryRole) {
        // Jika role dari DB tidak ada di priority list, gunakan role pertama yang ada
        const firstRole = normalized[0];
        // Cek apakah firstRole adalah valid role (case-insensitive)
        const matchedRole = priority.find((p) => p.toLowerCase() === firstRole?.toLowerCase());
        primaryRole = (matchedRole || 'Admin') as User['role'];
      }

      const user: User = {
        id: String(beUser.userId ?? beUser.id ?? ''),
        username: beUser.email ?? beUser.name ?? '',
        name: beUser.name ?? '',
        role: primaryRole,
        email: beUser.email ?? '',
        profile_image_path: beUser.profile_image_path ?? null,
        profile_image_url: beUser.profile_image_url ?? null,
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

        const data: SessionData | Record<string, any> = JSON.parse(sessionData);
        const user: User | undefined = (data as SessionData).user || (data as any).user;

        if (!user) {
          authService.logout();
          return null;
        }

        // IMPORTANT: keep existing user object (incl. profile_image_url/path)
        (data as any).user = user;

        // Update timestamp for activity tracking
        (data as SessionData).timestamp = Date.now();
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));

        // Extend expiry on activity (if not expired yet)
        const newExpiryTime =
          Date.now() + ((data as SessionData).rememberMe ? REMEMBER_ME_DURATION : SESSION_TIMEOUT);
        localStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());

        return user;
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
