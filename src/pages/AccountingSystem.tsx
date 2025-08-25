import { useState, useEffect } from "react";
import EnhancedHeader from "@/components/layout/EnhancedHeader";
import Sidebar from "@/components/layout/Sidebar";
import ChartOfAccounts from "@/components/modules/ChartOfAccounts";
import JournalEntry from "@/components/modules/JournalEntry";
import TrialBalance from "@/components/modules/TrialBalance";
import FinancialStatements from "@/components/modules/FinancialStatements";
import TaxSettings from "@/components/modules/TaxSettings";
import Invoices from "@/components/modules/Invoices";
import CompanySettings from "@/components/settings/EnhancedCompanySettings";
import DashboardOverview from "@/components/modules/DashboardOverview";
import SecurityDashboard from "@/components/modules/SecurityDashboard";

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
      case 'invoices':
        return <Invoices />;
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
        
        <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-72 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}