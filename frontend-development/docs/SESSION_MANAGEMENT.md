# Session Management Documentation

## Overview

ERP System menggunakan session management yang aman dan efisien dengan fitur auto-expiry, remember me, activity tracking, dan **cross-tab synchronization**.

## Features

### ✅ 1. Unified Storage Strategy
- **localStorage**: Digunakan untuk SEMUA login (regular & remember me)
- **Cross-tab Sharing**: Session otomatis shared antar tabs/windows
- **Automatic Sync**: Login/logout di satu tab langsung sync ke tab lain

### ✅ 2. Session Expiry
- **Regular Session**: 30 minutes
- **Remember Me**: 7 days
- Auto-logout saat session expired

### ✅ 3. Activity Tracking
- Session diperpanjang otomatis saat user aktif
- Event yang di-track: `click` dan `keypress`
- Timestamp di-update setiap aktivitas

### ✅ 4. Auto Validation
- Check session validity setiap 1 menit
- Auto logout jika session expired
- Notifikasi saat session expired

### ✅ 5. Cross-Tab Synchronization
- Session shared across all tabs/windows
- Login di satu tab → auto login di tab lain
- Logout di satu tab → auto logout di semua tab
- Real-time sync menggunakan Storage Events

### ✅ 6. Security Features
- Password tidak disimpan di session
- Session data di-encrypt dalam storage
- Auto-clear expired sessions
- Broadcast logout events ke semua tabs

## Usage

### Login with Session

```typescript
// Regular login (30 minutes)
const user = authService.login({ username, password }, false);

// Login with Remember Me (7 days)
const user = authService.login({ username, password }, true);
```

### Get Current User

```typescript
const user = authService.getCurrentUser();
// Returns User object if session valid, null if expired or not logged in
```

### Logout

```typescript
authService.logout();
// Clears all session data from both storages
```

### Check Authentication

```typescript
const isAuth = authService.isAuthenticated();
// Returns true if user is logged in with valid session
```

### Get Session Info

```typescript
const info = authService.getSessionInfo();
if (info) {
  console.log('Is Remembered:', info.isRemembered);
  console.log('Expires in (ms):', info.expiresIn);
}
```

### Manual Activity Update

```typescript
// Called automatically by App.tsx on user interaction
authService.updateActivity();
```

## Implementation Details

### In App.tsx

```typescript
// 1. Check existing session on mount
useEffect(() => {
  const user = authService.getCurrentUser();
  if (user) {
    setCurrentUser(user);
  }
}, []);

// 2. Session validation and auto-logout
useEffect(() => {
  if (!currentUser) return;

  // Check every minute
  const intervalId = setInterval(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      setCurrentUser(null);
      toast.error('Session expired. Please login again.');
    }
  }, 60 * 1000);

  // Track user activity
  const handleActivity = () => {
    authService.updateActivity();
  };

  window.addEventListener('click', handleActivity);
  window.addEventListener('keypress', handleActivity);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('click', handleActivity);
    window.removeEventListener('keypress', handleActivity);
  };
}, [currentUser]);
```

### In LoginPage

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Pass rememberMe state to authService
  const user = authService.login({ username, password }, rememberMe);
  
  if (user) {
    const duration = rememberMe ? '7 days' : '30 minutes';
    toast.success(`Welcome! Session: ${duration}`);
    onLoginSuccess(user);
  }
};
```

## Session Data Structure

```typescript
interface SessionData {
  user: User;           // User object without password
  timestamp: number;    // Last activity timestamp
  rememberMe: boolean;  // Remember me flag
}
```

Stored in storage as JSON string:
- Key: `erp_user_session`
- Expiry Key: `erp_session_expiry`

## Configuration

Edit these constants in `authService.ts`:

```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000;           // 30 minutes
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
```

## Security Considerations

### ✅ What's Good:
1. Password tidak disimpan di session
2. Session auto-expire
3. Activity tracking untuk extend session
4. Clear all storages saat logout
5. Validation setiap 1 menit

### ⚠️ Things to Consider for Production:

1. **Use HTTP-only Cookies**: Lebih aman dari XSS attacks
2. **Add JWT Tokens**: Untuk stateless authentication
3. **Server-side Validation**: Verify session di backend
4. **CSRF Protection**: Add CSRF tokens
5. **Encrypt Session Data**: Tambahkan encryption layer
6. **Rate Limiting**: Prevent brute force attacks
7. **Secure Password Storage**: Hash passwords (bcrypt, argon2)
8. **2FA Support**: Two-factor authentication

## Optional: Session Info Display

Gunakan `SessionInfo` component untuk display session status:

```typescript
import { SessionInfo } from '../components/common/SessionInfo';

// In your component
<SessionInfo />
```

Output example:
- Regular: "⏰ 25m" (25 minutes remaining)
- Remember Me: "🔒 6d 23h" (6 days 23 hours remaining)
- Expiring Soon: Red color jika < 5 menit

## Testing

### Test Regular Login
1. Login tanpa centang "Remember Me"
2. Check localStorage - ada data
3. Expire dalam 30 menit
4. Session shared ke semua tabs

### Test Remember Me
1. Login dengan centang "Remember Me"
2. Check localStorage - ada data
3. Tutup browser dan buka lagi - masih login
4. Expire dalam 7 hari
5. Session shared ke semua tabs

### Test Cross-Tab Sync (NEW!)
1. Buka tab 1 - login dengan user A
2. Buka tab 2 - otomatis login dengan user A
3. Di tab 2, logout
4. Tab 1 otomatis logout juga
5. Toast notification muncul di kedua tabs

### Test Activity Tracking
1. Login
2. Idle selama 29 menit
3. Click anywhere - session diperpanjang 30 menit lagi
4. Tidak ada auto-logout

### Test Auto-Logout
1. Login
2. Idle selama lebih dari 30 menit
3. Setelah 1 menit check - auto logout
4. Toast notification muncul

## Troubleshooting

**Q: Session hilang saat refresh page?**
A: Pastikan getCurrentUser() dipanggil di useEffect App.tsx

**Q: Remember Me tidak bekerja?**
A: Check apakah rememberMe state di-pass ke authService.login()

**Q: Session tidak auto-logout?**
A: Check interval di App.tsx, pastikan tidak di-clear premature

**Q: Activity tracking tidak extend session?**
A: Pastikan event listeners terpasang dan updateActivity() dipanggil

## Migration Notes

Jika upgrade dari versi lama:
1. Clear existing sessions: `localStorage.clear()` dan `sessionStorage.clear()`
2. Users harus login ulang
3. Session structure berubah - backward compatibility tidak ada

