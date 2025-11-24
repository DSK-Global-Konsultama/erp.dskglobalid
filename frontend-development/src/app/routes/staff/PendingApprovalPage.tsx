import { Clock, Mail, User, AlertCircle, CheckCircle2, FileText, LogOut } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface PendingApprovalPageProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function PendingApprovalPage({ userName, userEmail, onLogout }: PendingApprovalPageProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-3xl w-full space-y-3 sm:space-y-4 md:space-y-5">
        {/* Main Card */}
        <Card className="p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 md:space-y-6">
            {/* Icon */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-sm border-3 border-red-600">
                <Clock className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-black" strokeWidth="1.3" />
              </div>
            </div>

            {/* Title Section */}
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight px-2">
                Menunggu Persetujuan
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-xl mx-auto px-2 leading-relaxed">
                Akun Anda sedang menunggu persetujuan dari administrator. 
                Kami akan memproses permintaan Anda secepatnya.
              </p>
            </div>

            {/* User Info Card */}
            <div className="w-full space-y-2.5 sm:space-y-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 text-gray-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nama</p>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 break-words">{userName || 'User'}</p>
                </div>
              </div>
              {userEmail && (
                <div className="flex items-center gap-2.5 sm:gap-3 pt-2.5 border-t border-gray-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 text-gray-600" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 break-all">{userEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 shadow-sm">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-900 mb-1 sm:mb-1.5">
                    Apa yang terjadi selanjutnya?
                  </p>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                    Administrator akan meninjau permintaan akun Anda dan memberikan akses sesuai dengan role yang sesuai. 
                    Anda akan menerima notifikasi melalui email setelah akun Anda disetujui.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-3.5 border border-gray-200 shadow-sm hover:border-red-600 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">Review</span>
                </div>
                <p className="text-xs text-gray-600 text-left leading-relaxed">Administrator sedang meninjau informasi akun Anda</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-3.5 border border-gray-200 shadow-sm hover:border-red-600 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">Proses</span>
                </div>
                <p className="text-xs text-gray-600 text-left leading-relaxed">Proses persetujuan sedang berlangsung</p>
              </div>
              <div className="bg-white rounded-lg p-2.5 sm:p-3 md:p-3.5 border border-gray-200 shadow-sm hover:border-red-600 hover:shadow-md transition-all cursor-pointer sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-7 md:h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-amber-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">Notifikasi</span>
                </div>
                <p className="text-xs text-gray-600 text-left leading-relaxed">Anda akan mendapat notifikasi hasil persetujuan</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="w-full bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200 text-left">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">
                  Sementara menunggu persetujuan:
                </p>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-2.5 text-xs sm:text-sm text-gray-700">
                <li className="flex items-start gap-2 sm:gap-2.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pastikan informasi profil Anda sudah lengkap dan benar</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-2.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Hubungi administrator jika ada pertanyaan atau perubahan yang diperlukan</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-2.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3.5 md:h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Anda akan dapat mengakses sistem setelah akun disetujui</span>
                </li>
              </ul>
            </div>

            {/* Logout Button */}
            <div className="w-full">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Contact Info */}
            <div className="w-full pt-2.5 sm:pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center px-2">
                Butuh bantuan? Hubungi administrator atau tim IT support
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

