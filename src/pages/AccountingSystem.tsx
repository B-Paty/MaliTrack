import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ChartOfAccounts from "@/components/modules/ChartOfAccounts";
import JournalEntry from "@/components/modules/JournalEntry";
import TrialBalance from "@/components/modules/TrialBalance";
import FinancialStatements from "@/components/modules/FinancialStatements";
import TaxSettings from "@/components/modules/TaxSettings";
import Invoices from "@/components/modules/Invoices";
import { defaultCompanySettings } from "@/data/chartOfAccounts";
import CompanySettings from "@/components/modules/CompanySettings";

export default function AccountingSystem() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('chart-of-accounts');
  const [companySettings] = useState(defaultCompanySettings);

  const renderActiveModule = () => {
    switch (activeModule) {
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
      default:
        return <ChartOfAccounts />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        companyName={companySettings.companyName}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />
        
        <main className="flex-1 p-4 lg:p-6 lg:ml-0 overflow-x-hidden">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}