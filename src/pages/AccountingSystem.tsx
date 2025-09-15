import { useState, useEffect } from "react";
import EnhancedHeader from "@/components/layout/EnhancedHeader";
import Sidebar from "@/components/layout/Sidebar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ChartOfAccounts from "@/components/modules/ChartOfAccounts";
import JournalEntry from "@/components/modules/JournalEntry";
import TrialBalance from "@/components/modules/TrialBalance";
import FinancialStatements from "@/components/modules/FinancialStatements";
import TaxSettings from "@/components/modules/TaxSettings";
import Invoices from "@/components/modules/Invoices";
import CompanySettings from "@/components/settings/EnhancedCompanySettings";
import DashboardOverview from "@/components/modules/DashboardOverview";
import SecurityDashboard from "@/components/modules/SecurityDashboard";
import MajorClient from "@/components/modules/MajorClient";
import InventoryManagement from "@/components/modules/InventoryManagement";
import SalesModule from "@/components/modules/SalesModule";
import HelpSection from "@/components/modules/HelpSection";

export default function AccountingSystem() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('chart-of-accounts');

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail) setActiveModule(ce.detail);
    };
    window.addEventListener('qsa:navigate-module', handler as EventListener);
    return () => window.removeEventListener('qsa:navigate-module', handler as EventListener);
  }, []);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'chart-of-accounts':
        return <ChartOfAccounts />;
      case 'journal-entry':
        return <JournalEntry />;
      case 'major-client':
        return <MajorClient />;
      case 'invoices':
        return <Invoices />;
      case 'inventory-management':
        return <InventoryManagement />;
      case 'sales-module':
        return <SalesModule />;
      case 'trial-balance':
        return <TrialBalance />;
      case 'financial-statements':
        return <FinancialStatements />;
      case 'tax-settings':
        return <TaxSettings />;
      case 'company-settings':
        return <CompanySettings />;
      case 'security':
        return <SecurityDashboard />;
      case 'help':
        return <HelpSection />;
      default:
        return <ChartOfAccounts />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />
        
        <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-72 overflow-x-hidden min-h-[calc(100vh-4rem)] pb-20 lg:pb-6">
          {renderActiveModule()}
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />
    </div>
  );
}