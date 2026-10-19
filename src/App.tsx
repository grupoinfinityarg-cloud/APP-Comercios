/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationSectionId,
  Store as StoreType,
  Product,
  Sale,
  Customer,
  Supplier,
  Purchase,
  Promotion,
  Employee,
  SystemAlert,
  BusinessConfig,
  AuditLogEvent,
} from './types';
import {
  DEMO_STORES,
  DEMO_PRODUCTS,
  DEMO_SALES,
  DEMO_CUSTOMERS,
  DEMO_SUPPLIERS,
  DEMO_PURCHASES,
  DEMO_PROMOTIONS,
  DEMO_EMPLOYEES,
  DEMO_ALERTS,
  DEFAULT_BUSINESS_CONFIG,
  DEMO_AUDIT_LOGS,
} from './data/demoData';
import { createAuditEvent, CreateAuditEventParams } from './utils/auditLogger';

import { LoginScreen } from './components/Auth/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// 16 Module Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { StoresScreen } from './components/screens/StoresScreen';
import { ProductsScreen } from './components/screens/ProductsScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { SalesScreen } from './components/screens/SalesScreen';
import { CashRegisterScreen } from './components/screens/CashRegisterScreen';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { CurrentAccountsScreen } from './components/screens/CurrentAccountsScreen';
import { SuppliersScreen } from './components/screens/SuppliersScreen';
import { PurchasesScreen } from './components/screens/PurchasesScreen';
import { PromotionsScreen } from './components/screens/PromotionsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { EmployeesScreen } from './components/screens/EmployeesScreen';
import { AlertsScreen } from './components/screens/AlertsScreen';
import { MarketingScreen } from './components/screens/MarketingScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AuditLogScreen } from './components/screens/AuditLogScreen';

export default function App() {
  // Theme State (Persisted in localStorage with system preference fallback)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('comercios360_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('comercios360_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('comercios360_theme', 'light');
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Authentication State (separated professional login screen with demo mode indicator)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee>(DEMO_EMPLOYEES[0]);

  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavigationSectionId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Commerce Data State (Interactive memory with localStorage persistence for demo sessions)
  const [stores, setStores] = useState<StoreType[]>(() => {
    try {
      const saved = localStorage.getItem('comercios360_stores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to DEMO_STORES
    }
    return DEMO_STORES;
  });

  const [activeStore, setActiveStore] = useState<StoreType>(() => {
    try {
      const savedId = localStorage.getItem('comercios360_active_store_id');
      if (savedId) {
        const found = stores.find((s) => s.id === savedId);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return stores[0] || DEMO_STORES[0];
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    try {
      const saved = localStorage.getItem('comercios360_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_BUSINESS_CONFIG;
  });

  const handleUpdateStores = (updatedStores: StoreType[]) => {
    setStores(updatedStores);
    try {
      localStorage.setItem('comercios360_stores', JSON.stringify(updatedStores));
    } catch {
      // ignore
    }
    const currentActiveInUpdated = updatedStores.find((s) => s.id === activeStore.id);
    if (currentActiveInUpdated) {
      setActiveStore(currentActiveInUpdated);
    } else if (updatedStores.length > 0) {
      setActiveStore(updatedStores[0]);
    }
  };

  const handleSelectStore = (store: StoreType) => {
    setActiveStore(store);
    try {
      localStorage.setItem('comercios360_active_store_id', store.id);
    } catch {
      // ignore
    }
  };

  const handleUpdateBusinessConfig = (newConfig: BusinessConfig) => {
    setBusinessConfig(newConfig);
    try {
      localStorage.setItem('comercios360_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('comercios360_products');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEMO_PRODUCTS;
  });

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('comercios360_products', JSON.stringify(updatedProducts));
    } catch {
      // ignore
    }
  };

  const [sales, setSales] = useState<Sale[]>(DEMO_SALES);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [purchases, setPurchases] = useState<Purchase[]>(DEMO_PURCHASES);
  const [promotions, setPromotions] = useState<Promotion[]>(DEMO_PROMOTIONS);
  const [employees, setEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(DEMO_ALERTS);

  // Módulo 13: Audit Log State (Persisted in localStorage with DEMO_AUDIT_LOGS fallback)
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    try {
      const saved = localStorage.getItem('comercios360_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEMO_AUDIT_LOGS;
  });

  const handleUpdateAuditLogs = (newLogs: AuditLogEvent[]) => {
    setAuditLogs(newLogs);
    try {
      localStorage.setItem('comercios360_audit_logs', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
  };

  const handleRecordAuditEvent = (params: CreateAuditEventParams) => {
    try {
      setAuditLogs((prevLogs) => {
        const newEvent = createAuditEvent(
          {
            ...params,
            currentUser:
              params.currentUser !== undefined
                ? params.currentUser
                : currentUser
                ? { name: currentUser.name, role: currentUser.role, id: currentUser.id }
                : null,
            currentStore:
              params.currentStore !== undefined
                ? params.currentStore
                : activeStore
                ? { name: activeStore.name, id: activeStore.id }
                : null,
          },
          prevLogs
        );

        if (!newEvent) return prevLogs;

        const updated = [newEvent, ...prevLogs];
        try {
          localStorage.setItem('comercios360_audit_logs', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err) {
      console.warn('Error al registrar evento de auditoría:', err);
    }
  };

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentSection('dashboard');
  };

  const handleAddSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);
    // update store today's sales
    setStores((prev) =>
      prev.map((s) => (s.id === activeStore.id ? { ...s, todaySales: s.todaySales + newSale.total } : s))
    );

    // Registro automático de auditoría para la venta en POS completada
    handleRecordAuditEvent({
      module: 'Ventas y POS',
      action: 'Venta registrada en POS',
      category: 'sales',
      status: 'exitoso',
      details: `Venta completada por $${newSale.total.toLocaleString('es-AR')} abonada con ${newSale.paymentMethod}. Comprobante: ${newSale.ticketNumber}. Total de ítems: ${newSale.itemsCount}.`,
      entityId: newSale.ticketNumber || newSale.id,
      newValue: `Total: $${newSale.total.toLocaleString('es-AR')}`,
      severity: 'baja',
    });
  };

  const handleMarkAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleToggleAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  // If not authenticated, display login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#121614] text-[#111413] dark:text-[#F5F7F6] flex flex-col font-sans antialiased selection:bg-[#F3D3C4] selection:text-[#7C321B] transition-colors">
      <div className="flex flex-1">
        {/* Sidebar with 16 sections */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(section) => {
            setCurrentSection(section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            stores={stores}
            activeStore={activeStore}
            onSelectStore={handleSelectStore}
            currentUser={currentUser}
            onLogout={handleLogout}
            unreadAlertsCount={unreadAlertsCount}
            onNavigate={(sec) => setCurrentSection(sec)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          {/* Central Workspace */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentSection === 'dashboard' && (
              <DashboardScreen
                sales={sales}
                products={products}
                customers={customers}
                onNavigate={(sec) => setCurrentSection(sec)}
              />
            )}

            {currentSection === 'stores' && (
              <StoresScreen
                stores={stores}
                activeStore={activeStore}
                onSelectStore={setActiveStore}
              />
            )}

            {currentSection === 'products' && (
              <ProductsScreen
                products={products}
                currentUser={currentUser}
                activeStore={activeStore}
                onAuditLog={handleRecordAuditEvent}
                onUpdateProducts={handleUpdateProducts}
              />
            )}

            {currentSection === 'inventory' && (
              <InventoryScreen
                products={products}
                currentUser={currentUser}
                activeStore={activeStore}
                onAuditLog={handleRecordAuditEvent}
              />
            )}

            {currentSection === 'sales' && (
              <SalesScreen
                sales={sales}
                products={products}
                customers={customers}
                onAddSale={handleAddSale}
              />
            )}

            {currentSection === 'cash-register' && (
              <CashRegisterScreen
                currentUser={currentUser}
                activeStore={activeStore}
                onAuditLog={handleRecordAuditEvent}
              />
            )}

            {currentSection === 'customers' && (
              <CustomersScreen customers={customers} />
            )}

            {currentSection === 'current-accounts' && (
              <CurrentAccountsScreen customers={customers} />
            )}

            {currentSection === 'suppliers' && (
              <SuppliersScreen suppliers={suppliers} />
            )}

            {currentSection === 'purchases' && (
              <PurchasesScreen purchases={purchases} suppliers={suppliers} />
            )}

            {currentSection === 'promotions' && (
              <PromotionsScreen promotions={promotions} products={products} />
            )}

            {currentSection === 'reports' && (
              <ReportsScreen sales={sales} products={products} purchases={purchases} />
            )}

            {currentSection === 'employees' && (
              <EmployeesScreen
                employees={employees}
                stores={stores}
                currentUser={currentUser}
                onUpdateEmployees={setEmployees}
                onSwitchUser={(user) => setCurrentUser(user)}
                onNavigate={(sec) => setCurrentSection(sec)}
                auditLogs={auditLogs}
              />
            )}

            {currentSection === 'alerts' && (
              <AlertsScreen
                alerts={alerts}
                onMarkAllAsRead={handleMarkAllAlertsAsRead}
                onToggleRead={handleToggleAlertRead}
              />
            )}

            {currentSection === 'marketing' && (
              <MarketingScreen />
            )}

            {currentSection === 'settings' && (
              <SettingsScreen
                stores={stores}
                activeStore={activeStore}
                onSelectStore={handleSelectStore}
                onUpdateStores={handleUpdateStores}
                currentUser={currentUser}
                employees={employees}
                businessConfig={businessConfig}
                onUpdateBusinessConfig={handleUpdateBusinessConfig}
              />
            )}

            {currentSection === 'audit-log' && (
              <AuditLogScreen
                auditLogs={auditLogs}
                onUpdateAuditLogs={handleUpdateAuditLogs}
                currentUser={currentUser}
                employees={employees}
                stores={stores}
                onNavigate={(sec) => setCurrentSection(sec)}
              />
            )}
          </main>

          {/* Subdued Footer */}
          <footer className="py-4 px-6 border-t border-[#DCD6CC] dark:border-[#2E3531] text-center text-xs sm:text-sm text-[#4B524E] dark:text-[#CBD2CE] bg-[#FAF8F4]/90 dark:bg-[#161A18]/90">
            <p>
              COMERCIOS 360 &copy; 2026 • Sistema Profesional de Administración Comercial • Entorno de demostración
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
