import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { mockUsers, type User } from '../../../../lib/mock-data';
import { UserCog, Mail, Calendar, Clock } from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const usersWithRole = users.filter(u => u.role);
  const usersWithoutRole = users.filter(u => !u.role);

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'Super Admin':
        return 'destructive' as const;
      case 'BOD':
        return 'default' as const;
      case 'IT':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* Users Belum Ada Role - Priority */}
      {usersWithoutRole.length > 0 && (
        <Card className="border-2 border-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-4 w-4 text-orange-500" />
              Users Belum Ada Role
            </CardTitle>
            <CardDescription className="text-xs">User baru yang perlu di-assign role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersWithoutRole.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs px-1.5 py-0">
                        Belum Ada Role
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined: {formatDate(user.createdDate)}
                      </span>
                      {user.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last login: {formatDate(user.lastLogin)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Pilih Role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="BOD">BOD</SelectItem>
                        <SelectItem value="BD Content Creator">BD Content Creator</SelectItem>
                        <SelectItem value="BD Executive">BD Executive</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users ({usersWithRole.length})</CardTitle>
          <CardDescription className="text-xs">Daftar semua user yang sudah memiliki role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usersWithRole.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    {user.role && (
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-1.5 py-0">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined: {formatDate(user.createdDate)}
                    </span>
                    {user.lastLogin && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last login: {formatDate(user.lastLogin)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as User['role'])}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="BOD">BOD</SelectItem>
                      <SelectItem value="BD Content Creator">BD Content Creator</SelectItem>
                      <SelectItem value="BD Executive">BD Executive</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                      <SelectItem value="Consultant">Consultant</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
