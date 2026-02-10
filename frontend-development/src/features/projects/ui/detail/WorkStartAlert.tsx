/**
 * Alert: Work Start Allowed / Not Allowed based on payment gate.
 */

import { CheckCircle, XCircle } from 'lucide-react';

export interface WorkStartAlertProps {
  workStartAllowed: boolean;
  paymentGateStatus?: string;
}

export function WorkStartAlert({
  workStartAllowed,
  paymentGateStatus,
}: WorkStartAlertProps) {
  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        workStartAllowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {workStartAllowed ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <div className="font-medium text-green-900">Work Start Allowed</div>
              {paymentGateStatus && (
                <div className="text-sm text-green-700">
                  Payment gate status: {paymentGateStatus}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-medium text-red-900">Work Start Not Allowed</div>
              <div className="text-sm text-red-700">
                Waiting for payment. Contact Finance or BD for details.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
