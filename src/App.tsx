/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
} from './data/demoData';

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

export default function App() {
  // Authentication State (separated professional login screen with demo mode indicator)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee>(DEMO_EMPLOYEES[0]);

  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavigationSectionId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Commerce Data State (Interactive memory for demo session)
  const [stores, setStores] = useState<StoreType[]>(DEMO_STORES);
  const [activeStore, setActiveStore] = useState<StoreType>(DEMO_STORES[0]);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(DEMO_SALES);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [purchases, setPurchases] = useState<Purchase[]>(DEMO_PURCHASES);
  const [promotions, setPromotions] = useState<Promotion[]>(DEMO_PROMOTIONS);
  const [employees, setEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(DEMO_ALERTS);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
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
            onSelectStore={setActiveStore}
            currentUser={currentUser}
            onLogout={handleLogout}
            unreadAlertsCount={unreadAlertsCount}
            onNavigate={(sec) => setCurrentSection(sec)}
          />

          {/* Central Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
              <ProductsScreen products={products} />
            )}

            {currentSection === 'inventory' && (
              <InventoryScreen products={products} />
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
              <CashRegisterScreen />
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
              <PromotionsScreen promotions={promotions} />
            )}

            {currentSection === 'reports' && (
              <ReportsScreen sales={sales} products={products} />
            )}

            {currentSection === 'employees' && (
              <EmployeesScreen employees={employees} />
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
              <SettingsScreen />
            )}
          </main>

          {/* Subdued Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
            <p>
              COMERCIOS 360 &copy; 2026 • Sistema Profesional de Administración Comercial • Entorno de demostración
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
