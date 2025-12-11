import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export function Toast() {
  const { notifications, dismissNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => {
        const Icon = notification.type === 'success' ? CheckCircle :
                     notification.type === 'error' ? XCircle : Info;

        return (
          <div
            key={notification.id}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slideUp min-w-[300px] max-w-md',
              notification.type === 'success' && 'bg-green-50 border border-green-200',
              notification.type === 'error' && 'bg-red-50 border border-red-200',
              notification.type === 'info' && 'bg-blue-50 border border-blue-200'
            )}
          >
            <Icon
              size={20}
              className={clsx(
                notification.type === 'success' && 'text-green-600',
                notification.type === 'error' && 'text-red-600',
                notification.type === 'info' && 'text-blue-600'
              )}
            />
            <p className={clsx(
              'flex-1 text-sm font-medium',
              notification.type === 'success' && 'text-green-800',
              notification.type === 'error' && 'text-red-800',
              notification.type === 'info' && 'text-blue-800'
            )}>
              {notification.message}
            </p>
            <button
              onClick={() => dismissNotification(notification.id)}
              className={clsx(
                'p-1 rounded-lg transition-colors',
                notification.type === 'success' && 'hover:bg-green-100 text-green-600',
                notification.type === 'error' && 'hover:bg-red-100 text-red-600',
                notification.type === 'info' && 'hover:bg-blue-100 text-blue-600'
              )}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
