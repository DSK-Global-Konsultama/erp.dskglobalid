import { Clock, Mail, User, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/card';

interface PendingApprovalPageProps {
  userName?: string;
  userEmail?: string;
}

export function PendingApprovalPage({ userName, userEmail }: PendingApprovalPageProps) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Menunggu Persetujuan
            </h1>
            <p className="text-gray-600">
              Akun Anda sedang menunggu persetujuan dari administrator
            </p>
          </div>

          {/* User Info */}
          <div className="w-full space-y-4 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-semibold text-gray-900">{userName || 'User'}</p>
              </div>
            </div>
            {userEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{userEmail}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Alert */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Apa yang terjadi selanjutnya?
                </p>
                <p className="text-sm text-blue-800">
                  Administrator akan meninjau permintaan akun Anda dan memberikan akses sesuai dengan role yang sesuai. 
                  Anda akan menerima notifikasi setelah akun Anda disetujui.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full text-left space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Sementara menunggu persetujuan:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Pastikan informasi profil Anda sudah lengkap dan benar</li>
              <li>Hubungi administrator jika ada pertanyaan</li>
              <li>Anda akan dapat mengakses sistem setelah akun disetujui</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

