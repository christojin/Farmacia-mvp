import { useState } from 'react';
import {
  Heart,
  Search,
  QrCode,
  Star,
  Gift,
  TrendingUp,
  Crown,
  Plus,
  Award,
  UserPlus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loyaltyAccounts } from '../data/mockData';
import { useStore } from '../store/useStore';
import { Modal } from '../components/common/Modal';
import type { LoyaltyLevel } from '../types';
import clsx from 'clsx';

const levelConfig: Record<LoyaltyLevel, { label: string; color: string; minPoints: number; icon: typeof Star }> = {
  bronze: { label: 'Bronce', color: '#CD7F32', minPoints: 0, icon: Star },
  silver: { label: 'Plata', color: '#C0C0C0', minPoints: 500, icon: Star },
  gold: { label: 'Oro', color: '#FFD700', minPoints: 2000, icon: Crown },
  platinum: { label: 'Platino', color: '#E5E4E2', minPoints: 5000, icon: Crown },
};

const rewards = [
  { id: 1, name: '10% de descuento', points: 500, level: 'bronze' as LoyaltyLevel },
  { id: 2, name: '15% de descuento', points: 800, level: 'silver' as LoyaltyLevel },
  { id: 3, name: 'Consulta gratis', points: 1500, level: 'gold' as LoyaltyLevel },
  { id: 4, name: 'Vale de $200', points: 2000, level: 'gold' as LoyaltyLevel },
  { id: 5, name: 'Kit de salud premium', points: 3500, level: 'platinum' as LoyaltyLevel },
];

export function LoyaltyPage() {
  const { t } = useTranslation();
  const { customers, addCustomer, updateCustomerPoints, showNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const customersWithLoyalty = customers.map(customer => ({
    ...customer,
    loyalty: loyaltyAccounts.find(l => l.customerId === customer.id),
  }));

  const filteredCustomers = customersWithLoyalty.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomerData = selectedCustomer
    ? customersWithLoyalty.find(c => c.id === selectedCustomer)
    : null;

  const totalMembers = loyaltyAccounts.length;
  const totalPoints = loyaltyAccounts.reduce((sum, l) => sum + l.totalPointsEarned, 0);
  const avgPoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone) {
      showNotification('Por favor completa los campos requeridos', 'error');
      return;
    }

    const customer = addCustomer({
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      phone: newCustomer.phone,
      email: newCustomer.email || undefined,
      address: undefined,
      birthDate: undefined,
    });

    setSelectedCustomer(customer.id);
    setShowAddCustomer(false);
    setNewCustomer({ firstName: '', lastName: '', phone: '', email: '' });
    showNotification(`Cliente ${customer.firstName} creado exitosamente`, 'success');
  };

  const handleRedeemReward = (rewardName: string, rewardPoints: number) => {
    if (!selectedCustomerData?.loyalty) return;

    updateCustomerPoints(selectedCustomerData.id, -rewardPoints);
    showNotification(`Recompensa "${rewardName}" canjeada - ${rewardPoints} puntos`, 'success');
    // Force re-render by re-selecting customer
    setSelectedCustomer(null);
    setTimeout(() => setSelectedCustomer(selectedCustomerData.id), 0);
  };

  const handleAddPoints = () => {
    if (!selectedCustomerData || !pointsToAdd) return;
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      showNotification('Por favor ingresa un número válido de puntos', 'error');
      return;
    }

    updateCustomerPoints(selectedCustomerData.id, points);
    showNotification(`${points} puntos agregados a ${selectedCustomerData.firstName}`, 'success');
    setShowAddPoints(false);
    setPointsToAdd('');
    // Force re-render
    setSelectedCustomer(null);
    setTimeout(() => setSelectedCustomer(selectedCustomerData.id), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('loyalty.title')}</h1>
          <p className="text-slate-500">{t('loyalty.subtitle')}</p>
        </div>
        <button onClick={() => setShowAddCustomer(true)} className="btn btn-primary">
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <Heart className="text-pink-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
              <p className="text-sm text-slate-500">Miembros activos</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalPoints.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Puntos totales</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{avgPoints}</p>
              <p className="text-sm text-slate-500">Promedio por cliente</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Gift className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{rewards.length}</p>
              <p className="text-sm text-slate-500">Recompensas disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar cliente o escanear QR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredCustomers.map(customer => {
                const level = customer.loyalty?.level || 'bronze';
                const config = levelConfig[level];

                return (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer.id)}
                    className={clsx(
                      'w-full p-4 text-left hover:bg-slate-50 transition-colors',
                      selectedCustomer === customer.id && 'bg-teal-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: config.color }}
                      >
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{customer.phone}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color
                          }}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">
                          {customer.loyalty?.points.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-slate-400">puntos</p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Heart size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No se encontraron clientes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Detail */}
        <div className="lg:col-span-2">
          {selectedCustomerData ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                      style={{ backgroundColor: levelConfig[selectedCustomerData.loyalty?.level || 'bronze'].color }}
                    >
                      {selectedCustomerData.firstName[0]}{selectedCustomerData.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedCustomerData.firstName} {selectedCustomerData.lastName}
                      </h2>
                      <p className="text-slate-500">{selectedCustomerData.phone}</p>
                      <p className="text-sm text-slate-400">{selectedCustomerData.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="p-4 bg-slate-100 rounded-xl">
                      <QrCode size={80} className="text-slate-600" />
                      <p className="text-xs text-center mt-2 font-mono text-slate-500">
                        {selectedCustomerData.qrCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4 text-center bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                  <p className="text-3xl font-bold">
                    {selectedCustomerData.loyalty?.points.toLocaleString() || 0}
                  </p>
                  <p className="text-teal-100">Puntos disponibles</p>
                  <button
                    onClick={() => setShowAddPoints(true)}
                    className="mt-2 px-3 py-1 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
                  >
                    + Agregar puntos
                  </button>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCustomerData.loyalty?.totalPointsEarned.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-slate-500">Total acumulado</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedCustomerData.loyalty?.totalPointsRedeemed.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-slate-500">Canjeados</p>
                </div>
              </div>

              {/* Level Progress */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  Progreso de Nivel
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  {Object.entries(levelConfig).map(([level, config]) => {
                    const isActive = selectedCustomerData.loyalty?.level === level;
                    return (
                      <div key={level} className="flex-1 text-center">
                        <div
                          className={clsx(
                            'w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 transition-all',
                            isActive ? 'ring-4 ring-offset-2' : 'opacity-50'
                          )}
                          style={{
                            backgroundColor: config.color,
                            boxShadow: isActive ? `0 0 0 4px ${config.color}40` : undefined
                          }}
                        >
                          <config.icon size={20} className="text-white" />
                        </div>
                        <p className={clsx(
                          'text-sm font-medium',
                          isActive ? 'text-slate-900' : 'text-slate-400'
                        )}>
                          {config.label}
                        </p>
                        <p className="text-xs text-slate-400">{config.minPoints}+ pts</p>
                      </div>
                    );
                  })}
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                    style={{
                      width: `${Math.min((selectedCustomerData.loyalty?.totalPointsEarned || 0) / 5000 * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Available Rewards */}
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Gift size={20} className="text-purple-500" />
                  Recompensas Disponibles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rewards.map(reward => {
                    const customerLevel = selectedCustomerData.loyalty?.level || 'bronze';
                    const customerPoints = selectedCustomerData.loyalty?.points || 0;
                    const canRedeem = customerPoints >= reward.points;
                    const levelIndex = Object.keys(levelConfig).indexOf(customerLevel);
                    const rewardLevelIndex = Object.keys(levelConfig).indexOf(reward.level);
                    const hasLevel = levelIndex >= rewardLevelIndex;

                    return (
                      <div
                        key={reward.id}
                        className={clsx(
                          'p-4 rounded-lg border-2 transition-all',
                          canRedeem && hasLevel
                            ? 'border-teal-200 bg-teal-50'
                            : 'border-slate-200 bg-slate-50 opacity-60'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{reward.name}</span>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${levelConfig[reward.level].color}20`,
                              color: levelConfig[reward.level].color
                            }}
                          >
                            {levelConfig[reward.level].label}+
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            {reward.points.toLocaleString()} puntos
                          </span>
                          <button
                            onClick={() => handleRedeemReward(reward.name, reward.points)}
                            disabled={!canRedeem || !hasLevel}
                            className={clsx(
                              'btn btn-sm',
                              canRedeem && hasLevel ? 'btn-primary' : 'btn-secondary'
                            )}
                          >
                            Canjear
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Heart size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                Selecciona un cliente
              </h3>
              <p className="text-slate-400">
                Busca por nombre, teléfono o escanea un código QR
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        title="Nuevo Cliente"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                className="input"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                className="input"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="input"
              placeholder="555-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="input"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setShowAddCustomer(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddCustomer}
              className="btn btn-primary flex-1"
            >
              <UserPlus size={18} />
              Crear Cliente
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Points Modal */}
      <Modal
        isOpen={showAddPoints}
        onClose={() => {
          setShowAddPoints(false);
          setPointsToAdd('');
        }}
        title="Agregar Puntos"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Agregar puntos a <strong>{selectedCustomerData?.firstName} {selectedCustomerData?.lastName}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cantidad de puntos
            </label>
            <input
              type="number"
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(e.target.value)}
              className="input text-center text-2xl font-bold"
              placeholder="100"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            {[50, 100, 200, 500].map(pts => (
              <button
                key={pts}
                onClick={() => setPointsToAdd(pts.toString())}
                className="btn btn-secondary btn-sm flex-1"
              >
                +{pts}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => {
                setShowAddPoints(false);
                setPointsToAdd('');
              }}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddPoints}
              className="btn btn-primary flex-1"
            >
              Agregar Puntos
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
