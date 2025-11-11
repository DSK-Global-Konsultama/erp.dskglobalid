import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Settings, Bell, Shield, Database, Mail, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

export function SettingPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'ERP System',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    sessionTimeout: 30,
    
    // Notification Settings
    emailNotifications: true,
    ticketNotifications: true,
    reimburseNotifications: true,
    systemAlerts: true,
    
    // Security Settings
    passwordMinLength: 8,
    requireStrongPassword: true,
    twoFactorAuth: false,
    sessionTimeoutEnabled: true,
    
    // Database Settings
    backupFrequency: 'daily',
    backupRetention: 30,
    autoBackup: true,
    
    // Email Settings
    smtpHost: 'smtp.dskglobal.com',
    smtpPort: 587,
    smtpUser: 'noreply@dskglobal.com',
    smtpFrom: 'ERP System <noreply@dskglobal.com>',
    
    // General Settings
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    language: 'id-ID',
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Settings berhasil disimpan!');
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      systemName: 'ERP System',
      systemVersion: '1.0.0',
      maintenanceMode: false,
      sessionTimeout: 30,
      emailNotifications: true,
      ticketNotifications: true,
      reimburseNotifications: true,
      systemAlerts: true,
      passwordMinLength: 8,
      requireStrongPassword: true,
      twoFactorAuth: false,
      sessionTimeoutEnabled: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      autoBackup: true,
      smtpHost: 'smtp.dskglobal.com',
      smtpPort: 587,
      smtpUser: 'noreply@dskglobal.com',
      smtpFrom: 'ERP System <noreply@dskglobal.com>',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      language: 'id-ID',
    });
    toast.info('Settings direset ke default!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Kelola pengaturan sistem</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>System Settings</CardTitle>
          </div>
          <CardDescription>Pengaturan umum sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="systemVersion">System Version</Label>
              <Input
                id="systemVersion"
                value={settings.systemVersion}
                onChange={(e) => setSettings({ ...settings, systemVersion: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                  <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                  <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-xs text-gray-500">Aktifkan mode maintenance untuk maintenance sistem</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>Pengaturan notifikasi sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-xs text-gray-500">Aktifkan notifikasi via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ticketNotifications">Ticket Notifications</Label>
              <p className="text-xs text-gray-500">Notifikasi untuk ticket baru</p>
            </div>
            <Switch
              id="ticketNotifications"
              checked={settings.ticketNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, ticketNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reimburseNotifications">Reimburse Notifications</Label>
              <p className="text-xs text-gray-500">Notifikasi untuk reimburse baru</p>
            </div>
            <Switch
              id="reimburseNotifications"
              checked={settings.reimburseNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, reimburseNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="systemAlerts">System Alerts</Label>
              <p className="text-xs text-gray-500">Notifikasi untuk alert sistem</p>
            </div>
            <Switch
              id="systemAlerts"
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, systemAlerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Pengaturan keamanan sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passwordMinLength">Password Minimum Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireStrongPassword">Require Strong Password</Label>
              <p className="text-xs text-gray-500">Wajibkan password yang kuat</p>
            </div>
            <Switch
              id="requireStrongPassword"
              checked={settings.requireStrongPassword}
              onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPassword: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-xs text-gray-500">Aktifkan 2FA untuk semua user</p>
            </div>
            <Switch
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sessionTimeoutEnabled">Session Timeout Enabled</Label>
              <p className="text-xs text-gray-500">Aktifkan auto-logout setelah timeout</p>
            </div>
            <Switch
              id="sessionTimeoutEnabled"
              checked={settings.sessionTimeoutEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, sessionTimeoutEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Settings</CardTitle>
          </div>
          <CardDescription>Pengaturan backup database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select
                value={settings.backupFrequency}
                onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
              >
                <SelectTrigger id="backupFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="backupRetention">Backup Retention (days)</Label>
              <Input
                id="backupRetention"
                type="number"
                value={settings.backupRetention}
                onChange={(e) => setSettings({ ...settings, backupRetention: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoBackup">Auto Backup</Label>
              <p className="text-xs text-gray-500">Aktifkan backup otomatis</p>
            </div>
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>Pengaturan SMTP untuk email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="smtpUser">SMTP User</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="smtpFrom">From Email</Label>
              <Input
                id="smtpFrom"
                value={settings.smtpFrom}
                onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

