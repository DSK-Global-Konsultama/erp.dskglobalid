import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Users, UserPlus, Edit, Shield, Mail, AlertCircle, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { pendingUsersService, type PendingUser as PendingUserType } from '../../../../services/pendingUsersService';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'BOD' | 'BD-Content' | 'BD-Executive' | 'PM' | 'Admin' | 'ITSpecialist' | null;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface PendingUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  createdAt: string;
}

const mockUsers: UserAccount[] = [
  {
    id: 'U001',
    username: 'bod',
    name: 'Director',
    email: 'bod@dskglobal.com',
    role: 'BOD',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'U002',
    username: 'admin',
    name: 'Admin',
    email: 'admin@dskglobal.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'U003',
    username: 'sarah',
    name: 'Sarah Wijaya',
    email: 'sarah@dskglobal.com',
    role: 'BD-Content',
    status: 'active',
    createdAt: '2025-01-05',
  },
  {
    id: 'U004',
    username: 'tommy',
    name: 'Tommy Budiman',
    email: 'tommy@dskglobal.com',
    role: 'BD-Content',
    status: 'active',
    createdAt: '2025-01-05',
  },
  {
    id: 'U005',
    username: 'andi',
    name: 'Andi Wijaya',
    email: 'andi@dskglobal.com',
    role: 'BD-Executive',
    status: 'active',
    createdAt: '2025-01-10',
  },
  {
    id: 'U006',
    username: 'rina',
    name: 'Rina Kusuma',
    email: 'rina@dskglobal.com',
    role: 'BD-Executive',
    status: 'active',
    createdAt: '2025-01-10',
  },
  {
    id: 'U009',
    username: 'diana',
    name: 'Diana Putri',
    email: 'diana@dskglobal.com',
    role: 'PM',
    status: 'active',
    createdAt: '2025-01-15',
  },
  // Users without role (pending assignment)
  {
    id: 'U014',
    username: 'budi',
    name: 'Budi Santoso',
    email: 'budi@dskglobal.com',
    role: null,
    status: 'pending',
    createdAt: '2025-10-20',
  },
  {
    id: 'U015',
    username: 'siti',
    name: 'Siti Rahayu',
    email: 'siti@dskglobal.com',
    role: null,
    status: 'pending',
    createdAt: '2025-10-21',
  },
  {
    id: 'U016',
    username: 'ahmad',
    name: 'Ahmad Fauzi',
    email: 'ahmad@dskglobal.com',
    role: null,
    status: 'pending',
    createdAt: '2025-10-22',
  },
];

export function UserAccountPage() {
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [pendingUsers, setPendingUsers] = useState<PendingUserType[]>(pendingUsersService.getPendingUsers());
  const [showForm, setShowForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUserType | null>(null);
  const [assignRole, setAssignRole] = useState<UserAccount['role']>('BD-Content');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'BD-Content' as UserAccount['role'],
  });

  // Refresh pending users when component mounts or when needed
  const refreshPendingUsers = () => {
    setPendingUsers(pendingUsersService.getPendingUsers());
  };

  // Load pending users on mount
  useEffect(() => {
    refreshPendingUsers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setFormData({ username: '', name: '', email: '', role: 'BD-Content' });
    setShowForm(false);
    toast.success('User berhasil ditambahkan!');
  };

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...formData, status: u.status } as UserAccount
        : u
    );
    setUsers(updatedUsers);
    setShowEditDialog(false);
    setSelectedUser(null);
    setFormData({ username: '', name: '', email: '', role: 'BD-Content' });
    toast.success('User berhasil di-update!');
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as UserAccount['status'] }
        : u
    );
    setUsers(updatedUsers);
    const user = users.find(u => u.id === userId);
    toast.success(`User ${user?.name} status berhasil diubah!`);
  };

  const handleAssignRole = (pendingUser: PendingUserType) => {
    setSelectedPendingUser(pendingUser);
    setAssignRole('BD-Content');
    setShowAssignRoleDialog(true);
  };

  const handleAssignRoleSubmit = () => {
    if (!selectedPendingUser || !assignRole) return;

    // Add user to users list with assigned role
    const newUser: UserAccount = {
      id: selectedPendingUser.id.replace('P', 'U'), // Convert pending ID to user ID
      username: selectedPendingUser.username,
      name: selectedPendingUser.name,
      email: selectedPendingUser.email,
      role: assignRole,
      status: 'active',
      createdAt: selectedPendingUser.createdAt,
    };

    // Remove from pending and add to users
    pendingUsersService.removePendingUser(selectedPendingUser.id);
    setUsers([...users, newUser]);
    refreshPendingUsers();
    
    setShowAssignRoleDialog(false);
    setSelectedPendingUser(null);
    setAssignRole('BD-Content');
    toast.success(`Role ${assignRole} berhasil di-assign ke ${selectedPendingUser.name}!`);
  };

  const getRoleColor = (role: string | null) => {
    if (!role) return 'bg-gray-50 text-gray-700 border-gray-200';
    switch (role) {
      case 'BOD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'ITSpecialist':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BD-Content':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'BD-Executive':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PM':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const pendingCount = pendingUsers.length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{users.length}</div>
            <p className="text-xs text-gray-500 mt-1">Semua akun</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">{pendingCount}</div>
            <p className="text-xs text-gray-500 mt-1">Perlu assign role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">{activeUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-600">{inactiveUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Tidak aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for Pending Users */}
      {pendingCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian!</AlertTitle>
          <AlertDescription>
            Ada {pendingCount} user baru yang belum di-assign role. Silakan assign role untuk mengaktifkan akun mereka.
          </AlertDescription>
        </Alert>
      )}

      {/* Create User Button */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah User Baru
        </Button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Tambah User Baru</CardTitle>
            <CardDescription>Buat akun baru dan atur role-nya</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value as UserAccount['role'] })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOD">BOD</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="BD-Content">BD-Content</SelectItem>
                    <SelectItem value="BD-Executive">BD-Executive</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Tambah User</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Users Table */}
      {pendingCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Role Assignment ({pendingCount})
            </CardTitle>
            <CardDescription>User baru yang perlu di-assign role oleh IT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tanggal Registrasi</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((pendingUser) => (
                    <TableRow key={pendingUser.id} className="bg-orange-50/50">
                      <TableCell className="font-medium">{pendingUser.id}</TableCell>
                      <TableCell>{pendingUser.username}</TableCell>
                      <TableCell>{pendingUser.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{pendingUser.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pendingUser.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssignRole(pendingUser)}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Assign Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar User Accounts ({users.length})</CardTitle>
          <CardDescription>Kelola semua akun dan role pengguna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Ubah informasi user: {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role || ''}
                onValueChange={(value: any) => setFormData({ ...formData, role: value as UserAccount['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOD">BOD</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="BD-Content">BD-Content</SelectItem>
                  <SelectItem value="BD-Executive">BD-Executive</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedUser(null);
              setFormData({ username: '', name: '', email: '', role: 'BD-Content' });
            }}>
              Batal
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignRoleDialog} onOpenChange={setShowAssignRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign role untuk user: {selectedPendingUser?.name} ({selectedPendingUser?.username})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User Information</Label>
              <div className="p-3 bg-gray-50 rounded-md space-y-1">
                <p className="text-sm"><strong>Nama:</strong> {selectedPendingUser?.name}</p>
                <p className="text-sm"><strong>Username:</strong> {selectedPendingUser?.username}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedPendingUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={assignRole || ''}
                onValueChange={(value: any) => setAssignRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOD">BOD</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="BD-Content">BD-Content</SelectItem>
                  <SelectItem value="BD-Executive">BD-Executive</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAssignRoleDialog(false);
              setSelectedPendingUser(null);
              setAssignRole('BD-Content');
            }}>
              Batal
            </Button>
            <Button onClick={handleAssignRoleSubmit} disabled={!assignRole}>
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

