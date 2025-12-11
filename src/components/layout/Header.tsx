import { Bell, Search, User, Menu, AlertTriangle, Globe } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { t } from '../../utils/translations';

export function Header() {
  const { currentUser, alerts, isTrainingMode, toggleTrainingMode, toggleSidebar, language, toggleLanguage } = useStore();
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <>
      {isTrainingMode && (
        <div className="training-mode-banner flex items-center justify-center gap-2">
          <AlertTriangle size={16} />
          {t('header.trainingMode', language)}
          <button
            onClick={toggleTrainingMode}
            className="ml-4 px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors"
          >
            {t('header.deactivate', language)}
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden btn btn-ghost btn-icon"
          >
            <Menu size={20} />
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder', language)}
              className="input pl-10 w-64 lg:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-ghost btn-sm flex items-center gap-2 border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all"
            title={t('header.switchLanguage', language)}
          >
            <Globe size={16} className="text-slate-600" />
            <span className="font-semibold text-sm">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>

          {/* Training Mode Toggle */}
          {currentUser?.role === 'admin' && !isTrainingMode && (
            <button
              onClick={toggleTrainingMode}
              className="btn btn-secondary btn-sm"
              title={t('header.activateTraining', language)}
            >
              <AlertTriangle size={16} />
              <span className="hidden sm:inline">{t('header.trainingModeBtn', language)}</span>
            </button>
          )}

          {/* Notifications */}
          <button className="btn btn-ghost btn-icon relative">
            <Bell size={20} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">{currentUser?.name || 'Usuario'}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser?.role || 'Sin rol'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
