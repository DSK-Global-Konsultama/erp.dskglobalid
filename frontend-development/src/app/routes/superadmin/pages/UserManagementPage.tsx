import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { userService, type CreateUserPayload, type UpdateUserPayload } from '../../../../services/userService';
import { roleService, type Role } from '../../../../services/roleService';
import { departmentService, type Department } from '../../../../services/departmentService';
import { Plus, Edit2, Trash2, Loader2, Circle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { toast } from 'sonner';

interface DisplayUser {
  id: number;
  name: string;
  email: string;
  username: string;
  profile_image_url?: string | null;
  role?: {
    id: number;
    code: string;
    name: string;
  };
  departments: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  is_active: boolean;
  created_at?: string | null;
  last_login_at?: string | null;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile image states (create/edit)
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [selectedProfileImagePreview, setSelectedProfileImagePreview] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateUserPayload>({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role_code: '',
    is_active: true,
    departments: [],
  });

  // Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('[UserManagement] Fetching data...');
      const token = localStorage.getItem('erp_auth_token');
      console.log('[UserManagement] Token exists:', !!token);
      
      const [usersData, rolesData, departmentsData] = await Promise.all([
        userService.getAllUsers(),
        roleService.getAllRoles(),
        departmentService.getAllDepartments(),
      ]);

      console.log('[UserManagement] Data fetched:', {
        users: usersData.length,
        roles: rolesData.length,
        departments: departmentsData.length,
      });

      // Map backend users to display format
      const mappedUsers: DisplayUser[] = usersData.map((user) => {
        // Debug: log data untuk troubleshooting
        console.log('[UserManagement] Mapping user:', {
          id: user.id,
          name: user.full_name,
          is_active: user.is_active,
          is_active_type: typeof user.is_active,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          last_login_at_type: typeof user.last_login_at,
          created_at_type: typeof user.created_at,
        });
        
        // Ensure is_active is boolean (handle case where backend might send 0/1)
        // Backend should send boolean, but handle number case just in case
        const isActive = user.is_active === true || (typeof user.is_active === 'number' && user.is_active === 1);
        
        // Ensure dates are strings or null
        const created_at = user.created_at && typeof user.created_at === 'string' ? user.created_at : null;
        const last_login_at = user.last_login_at && typeof user.last_login_at === 'string' ? user.last_login_at : null;
        
        return {
          id: user.id,
          name: user.full_name,
          email: user.email,
          username: user.username,
          profile_image_url: user.profile_image_url,
          role: user.role,
          departments: user.departments,
          is_active: isActive,
          created_at: created_at,
          last_login_at: last_login_at,
        };
      });

      setUsers(mappedUsers);
      setRoles(rolesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('[UserManagement] Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data';
      console.error('[UserManagement] Error details:', {
        message: errorMessage,
        error,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (file: File | null) => {
    // cleanup previous preview url
    if (selectedProfileImagePreview) URL.revokeObjectURL(selectedProfileImagePreview);

    setSelectedProfileImage(file);
    if (file) {
      setSelectedProfileImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedProfileImagePreview(null);
    }
  };

  const validateProfileImage = (file: File): string | null => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return 'Format foto harus JPG/PNG/WEBP';
    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) return 'Ukuran foto maksimal 2MB';
    return null;
  };

  const uploadProfileImageIfAny = async (userId: number) => {
    if (!selectedProfileImage) return;

    const validationError = validateProfileImage(selectedProfileImage);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await userService.updateProfileImage(userId, selectedProfileImage);
  };

  const handleCreateUser = async () => {
    if (!formData.full_name || !formData.email || !formData.username || !formData.password || !formData.role_code) {
      toast.error('Semua field wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await userService.createUser(formData);
      // upload foto (optional) after user created
      try {
        await uploadProfileImageIfAny(created.id);
      } catch (e) {
        console.error('Error uploading profile image:', e);
        toast.error(e instanceof Error ? e.message : 'Gagal upload foto profile');
      }

      toast.success('User berhasil dibuat');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAllData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const updatePayload: UpdateUserPayload = {
      full_name: formData.full_name || undefined,
      email: formData.email || undefined,
      username: formData.username || undefined,
      password: formData.password || undefined,
      role_code: formData.role_code || undefined,
      is_active: formData.is_active,
      departments: formData.departments,
    };

    // Remove undefined fields
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key as keyof UpdateUserPayload] === undefined) {
        delete updatePayload[key as keyof UpdateUserPayload];
      }
    });

    setIsSubmitting(true);
    try {
      await userService.updateUser(editingUser.id, updatePayload);

      // upload foto (optional) after update
      try {
        await uploadProfileImageIfAny(editingUser.id);
      } catch (e) {
        console.error('Error uploading profile image:', e);
        toast.error(e instanceof Error ? e.message : 'Gagal upload foto profile');
      }

      toast.success('User berhasil diupdate');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetForm();
      fetchAllData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengupdate user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?`)) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      toast.success('User berhasil dihapus');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus user');
    }
  };


  const handleOpenEditDialog = (user: DisplayUser) => {
    setEditingUser(user);
    setFormData({
      full_name: user.name,
      email: user.email,
      username: user.username,
      password: '', // Don't pre-fill password
      role_code: user.role?.code || '',
      is_active: user.is_active,
      departments: user.departments.map((d) => d.code),
    });

    // reset selected file and set preview to existing image
    handleProfileImageChange(null);
    setSelectedProfileImagePreview(user.profile_image_url ? getProfileImageUrl(user.profile_image_url) : null);

    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      username: '',
      password: '',
      role_code: '',
      is_active: true,
      departments: [],
    });

    handleProfileImageChange(null);
  };


  const getRoleBadgeVariant = (roleCode?: string) => {
    switch (roleCode) {
      case 'SUPERADMIN':
        return 'destructive' as const;
      case 'CEO':
        return 'default' as const;
      case 'ADMIN':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const getLoginStatus = (lastLoginAt: string | null | undefined): { status: 'online' | 'offline'; label: string } => {
    // Jika tidak ada last_login_at, berarti belum pernah login
    if (!lastLoginAt) {
      return { status: 'offline', label: 'Belum pernah login' };
    }
    
    try {
      const lastLogin = new Date(lastLoginAt);
      const now = new Date();
      
      // Check if date is valid
      if (isNaN(lastLogin.getTime())) {
        return { status: 'offline', label: 'Data tidak valid' };
      }
      
      // Hitung selisih waktu dalam menit
      const diffInMinutes = (now.getTime() - lastLogin.getTime()) / (1000 * 60);
      
      // Logika status:
      // - Jika login dalam 30 menit terakhir = "Online"
      // - Jika login lebih dari 30 menit yang lalu = "Offline" (diasumsikan sudah logout / tidak aktif)
      // - Jika waktu negatif (masa depan) = error data, anggap offline
      if (diffInMinutes < 0) {
        return { status: 'offline', label: 'Data tidak valid' };
      }

      if (diffInMinutes <= 30) {
        return { status: 'online', label: 'Online' };
      }

      return { status: 'offline', label: 'Offline' };
    } catch (error) {
      console.error('[getLoginStatus] Error:', error);
      return { status: 'offline', label: 'Error membaca data' };
    }
  };

  const getApiBase = (): string => {
    const envBase = (import.meta.env.VITE_API_BASE_URL || '').toString().trim();
    const base = envBase || 'http://localhost:3000';
    return base.replace(/\/+$/, '');
  };

  const getProfileImageUrl = (profileImageUrl: string | null | undefined): string => {
    if (profileImageUrl) {
      const apiBase = getApiBase();
      return `${apiBase}${profileImageUrl}`;
    }
    // Use default avatar from backend
    const apiBase = getApiBase();
    return `${apiBase}/uploads/profile_images/avatar_default.jpg`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola pengguna sistem ERP</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* All Users Table */}
      <Card>
          <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users ({users.length})</CardTitle>
          <CardDescription className="text-xs">Daftar semua user sistem</CardDescription>
          </CardHeader>
          <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Tidak ada user</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Login</TableHead>
                  <TableHead>Akun Dibuat</TableHead>
                  <TableHead className="text-right w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const loginStatus = getLoginStatus(user.last_login_at);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <img
                          src={getProfileImageUrl(user.profile_image_url)}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback ke default jika gambar gagal load
                            const apiBase = getApiBase();
                            (e.target as HTMLImageElement).src = `${apiBase}/uploads/profile_images/avatar_default.jpg`;
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          {!user.is_active && (
                            <Badge variant="outline" className="w-fit mt-1 text-xs">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant={getRoleBadgeVariant(user.role.code)} className="text-xs">
                            {user.role.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                        Belum Ada Role
                      </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Circle
                            className={`h-2 w-2 ${
                              loginStatus.status === 'online' ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                            }`}
                          />
                          <span className="text-sm">{loginStatus.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(user.last_login_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                    </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>Isi form di bawah untuk membuat user baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Profile image */}
            <div className="space-y-2">
              <Label htmlFor="profile_image">Foto Profile</Label>
              <div className="flex items-center gap-4">
                <img
                  src={selectedProfileImagePreview || getProfileImageUrl(null)}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border"
                  onError={(e) => {
                    const apiBase = getApiBase();
                    (e.target as HTMLImageElement).src = `${apiBase}/uploads/profile_images/avatar_default.jpg`;
                  }}
                />
                <div className="flex-1">
                  <Input
                    id="profile_image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const err = validateProfileImage(file);
                        if (err) {
                          toast.error(err);
                          e.target.value = '';
                          handleProfileImageChange(null);
                          return;
                        }
                      }
                      handleProfileImageChange(file);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG/PNG/WEBP, maks 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masukkan username"
                />
                    </div>
                  </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Masukkan email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_code">Role *</Label>
                    <Select
                  value={formData.role_code}
                  onValueChange={(value) => setFormData({ ...formData, role_code: value })}
                    >
                  <SelectTrigger id="role_code">
                    <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.code}>
                        {role.name}
                      </SelectItem>
                    ))}
                      </SelectContent>
                    </Select>
                  </div>
              <div className="space-y-2">
                <Label htmlFor="departments">Departments</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!formData.departments?.includes(value)) {
                      setFormData({
                        ...formData,
                        departments: [...(formData.departments || []), value],
                      });
                    }
                  }}
                >
                  <SelectTrigger id="departments">
                    <SelectValue placeholder="Pilih department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((dept) => !formData.departments?.includes(dept.code))
                      .map((dept) => (
                        <SelectItem key={dept.id} value={dept.code}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.departments && formData.departments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.departments.map((deptCode) => {
                      const dept = departments.find((d) => d.code === deptCode);
                      return (
                        <Badge
                          key={deptCode}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              departments: formData.departments?.filter((d) => d !== deptCode),
                            });
                          }}
                        >
                          {dept?.name || deptCode} ×
                      </Badge>
                      );
                    })}
                  </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                User Aktif
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update informasi user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Profile image */}
            <div className="space-y-2">
              <Label htmlFor="edit_profile_image">Foto Profile</Label>
              <div className="flex items-center gap-4">
                <img
                  src={selectedProfileImagePreview || (editingUser ? getProfileImageUrl(editingUser.profile_image_url) : getProfileImageUrl(null))}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border"
                  onError={(e) => {
                    const apiBase = getApiBase();
                    (e.target as HTMLImageElement).src = `${apiBase}/uploads/profile_images/avatar_default.jpg`;
                  }}
                />
                <div className="flex-1">
                  <Input
                    id="edit_profile_image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const err = validateProfileImage(file);
                        if (err) {
                          toast.error(err);
                          e.target.value = '';
                          handleProfileImageChange(null);
                          return;
                        }
                      }
                      handleProfileImageChange(file);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Pilih foto baru untuk mengganti (opsional)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Nama Lengkap</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masukkan username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Masukkan email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_password">Password (kosongkan jika tidak ingin mengubah)</Label>
              <Input
                id="edit_password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan password baru"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_role_code">Role</Label>
                  <Select
                  value={formData.role_code}
                  onValueChange={(value) => setFormData({ ...formData, role_code: value })}
                  >
                  <SelectTrigger id="edit_role_code">
                    <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.code}>
                        {role.name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2">
                <Label htmlFor="edit_departments">Departments</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!formData.departments?.includes(value)) {
                      setFormData({
                        ...formData,
                        departments: [...(formData.departments || []), value],
                      });
                    }
                  }}
                >
                  <SelectTrigger id="edit_departments">
                    <SelectValue placeholder="Pilih department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((dept) => !formData.departments?.includes(dept.code))
                      .map((dept) => (
                        <SelectItem key={dept.id} value={dept.code}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.departments && formData.departments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.departments.map((deptCode) => {
                      const dept = departments.find((d) => d.code === deptCode);
                      return (
                        <Badge
                          key={deptCode}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              departments: formData.departments?.filter((d) => d !== deptCode),
                            });
                          }}
                        >
                          {dept?.name || deptCode} ×
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active" className="cursor-pointer">
                User Aktif
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
