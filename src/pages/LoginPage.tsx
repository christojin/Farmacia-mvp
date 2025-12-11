import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield, Activity, Package, Users, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, language } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password);
    if (!success) {
      setError(t('auth.invalidCredentials'));
    }
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@farmacia.com', role: t('loyalty.tier') === 'Tier' ? 'Administrator' : 'Administrador' },
    { email: 'cajero1@farmacia.com', role: language === 'es' ? 'Cajero' : 'Cashier' },
    { email: 'doctor@farmacia.com', role: language === 'es' ? 'Médico' : 'Doctor' },
  ];

  const features = [
    { icon: Activity, label: t('nav.pos') },
    { icon: Package, label: t('nav.inventory') },
    { icon: Users, label: t('nav.consultation') },
    { icon: BarChart3, label: t('admin.reports') },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding (Hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        {/* Gradient background - teal to emerald */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488] via-[#14B8A6] to-[#2DD4BF]" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Decorative Geometric Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-32 h-32 rounded-full border border-white/20" />
          <div className="absolute top-32 right-24 w-24 h-24 rounded-full border border-white/15" />
          <div className="absolute bottom-24 left-24 w-40 h-40 rounded-full border border-white/10" />
          <div className="absolute bottom-48 right-16 w-20 h-20 rounded-full border border-white/15" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 text-white">
          {/* Logo */}
          <div className="mb-12">
            <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center mb-6 logo-heartbeat shadow-xl border border-white/20">
              <span className="text-4xl font-bold">+</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-4">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-md">
              {t('auth.signInToContinue')}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium">{feature.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-stone-50/50">
        <div className="w-full max-w-md animate-slideUp">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#14B8A6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0D9488]/20 logo-heartbeat">
              <span className="text-white text-3xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-700">FarmaSys</h1>
            <p className="text-stone-500">{t('auth.signInToContinue')}</p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-stone-700 mb-2">{t('auth.login')}</h2>
            <p className="text-stone-500">{t('auth.enterCredentials')}</p>
          </div>

          {/* Form Card */}
          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@farmacia.com"
                    className="input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-scaleIn">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full btn-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('common.loading')}
                  </span>
                ) : (
                  t('auth.login')
                )}
              </button>
            </form>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-stone-200" />
              <p className="text-sm text-stone-500 font-medium">
                {language === 'es' ? 'Cuentas de demostración' : 'Demo accounts'}
              </p>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="grid gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('demo123');
                  }}
                  className="w-full p-4 text-left bg-white hover:bg-stone-50 rounded-xl border border-stone-200 hover:border-[#0D9488]/40 transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-700 group-hover:text-[#0F766E] transition-colors">
                        {account.email}
                      </p>
                      <p className="text-sm text-stone-500">{account.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-[#0D9488]/10 flex items-center justify-center transition-colors">
                      <Mail size={16} className="text-stone-400 group-hover:text-[#0D9488] transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-stone-400">
            <Shield size={16} className="text-[#0D9488]" />
            <span>{language === 'es' ? 'Conexión segura con encriptación SSL' : 'Secure connection with SSL encryption'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
