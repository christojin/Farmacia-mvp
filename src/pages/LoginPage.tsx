import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(email, password);
    if (!success) {
      setError('Credenciales inválidas. Prueba con admin@farmacia.com');
    }
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@farmacia.com', role: 'Administrador' },
    { email: 'cajero1@farmacia.com', role: 'Cajero' },
    { email: 'doctor@farmacia.com', role: 'Médico' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg logo-heartbeat">
              <span className="text-white text-3xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">FarmaSys</h1>
            <p className="text-slate-500">Sistema de Gestión de Farmacia</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@farmacia.com"
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full btn-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center mb-4">
              Cuentas de demostración (cualquier contraseña)
            </p>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('demo123');
                  }}
                  className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <p className="font-medium text-slate-900">{account.email}</p>
                  <p className="text-sm text-slate-500">{account.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Shield size={16} />
            <span>Conexión segura con encriptación SSL</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white" />
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full border-4 border-white" />
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full border-4 border-white" />
          <div className="absolute bottom-40 right-10 w-20 h-20 rounded-full border-4 border-white" />
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl font-bold">+</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Bienvenido a FarmaSys
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            El sistema integral más completo para la gestión de tu farmacia con consultorio médico
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              'Punto de Venta',
              'Inventario Inteligente',
              'Consultorio Médico',
              'Programa de Lealtad',
              'Multi-sucursal',
              'Reportes en tiempo real',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-300" />
                <span className="text-teal-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
