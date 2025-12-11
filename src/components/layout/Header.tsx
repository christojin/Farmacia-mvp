import { Bell, Search, User, Menu, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';

export function Header() {
  const { t, i18n } = useTranslation();
  const { currentUser, alerts, isTrainingMode, toggleTrainingMode, toggleSidebar, language, setLanguage } = useStore();
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const handleLanguageToggle = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('farmacia-language', newLang);
  };

  return (
    <>
      {isTrainingMode && (
        <div className="training-mode-banner flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle size={16} />
          <span className="hidden sm:inline">{t('auth.trainingMode')} - {t('auth.trainingModeDesc')}</span>
          <span className="sm:hidden text-sm">TRAINING MODE</span>
          <button
            onClick={toggleTrainingMode}
            className="ml-2 sm:ml-4 px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden btn btn-ghost btn-icon"
          >
            <Menu size={20} />
          </button>

          {/* Search - Hidden on mobile, visible on sm+ */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder={t('header.search')}
              className="input pl-11 w-48 md:w-64 lg:w-80"
            />
          </div>

          {/* Mobile Search Icon */}
          <button className="sm:hidden btn btn-ghost btn-icon">
            <Search size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="btn btn-ghost btn-sm flex items-center gap-1.5 sm:gap-2 border border-stone-200 hover:border-[#0D9488]/40 hover:bg-stone-50 transition-all"
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Globe size={16} className="text-stone-500" />
            <span className="font-semibold text-sm text-stone-600">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>

          {/* Training Mode Toggle - Hidden on mobile unless admin */}
          {currentUser?.role === 'admin' && !isTrainingMode && (
            <button
              onClick={toggleTrainingMode}
              className="hidden sm:flex btn btn-secondary btn-sm"
              title={t('auth.trainingMode')}
            >
              <AlertTriangle size={16} />
              <span className="hidden md:inline">{t('auth.trainingMode')}</span>
            </button>
          )}

          {/* Notifications */}
          <button className="btn btn-ghost btn-icon relative">
            <Bell size={20} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-stone-200">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-stone-800 truncate max-w-[120px]">
                {currentUser?.name || 'Usuario'}
              </p>
              <p className="text-xs text-stone-500 capitalize">{currentUser?.role || 'Sin rol'}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center shadow-md shadow-[#0D9488]/20">
              <User size={18} className="text-white" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
