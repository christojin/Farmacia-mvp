import { useStore } from './store/useStore';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { InventoryPage } from './pages/InventoryPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { LoyaltyPage } from './pages/LoyaltyPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  const { isAuthenticated, currentModule } = useStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardPage />;
      case 'pos':
        return <POSPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'consultation':
        return <ConsultationPage />;
      case 'loyalty':
        return <LoyaltyPage />;
      case 'customers':
        return <LoyaltyPage />; // Reuse loyalty page for customers
      case 'admin':
        return <AdminPage />;
      case 'reports':
        return <AdminPage />; // Reuse admin for reports
      case 'branches':
        return (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Multi-sucursal</h2>
            <p className="text-slate-500">Gestión de sucursales - Próximamente</p>
          </div>
        );
      case 'ecommerce':
        return (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">E-commerce</h2>
            <p className="text-slate-500">Tienda en línea - Próximamente</p>
          </div>
        );
      case 'settings':
        return (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Configuración</h2>
            <p className="text-slate-500">Ajustes del sistema - Próximamente</p>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MainLayout>
      {renderModule()}
    </MainLayout>
  );
}

export default App;
