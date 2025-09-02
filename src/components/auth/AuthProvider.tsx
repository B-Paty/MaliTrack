/**
 * AuthProvider
 * Manages authentication state and provides auth context to the app.
 * - Handles Supabase auth state changes
 * - Provides login, signup, logout functions
 * - Shows loading state during auth checks
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createDefaultAccounts = async (userId: string) => {
    const defaultAccounts = [
      // Current Assets
      { account_code: '1010', account_name: 'Cash in Hand', category: 'Current Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1020', account_name: 'Bank Account', category: 'Current Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1030', account_name: 'Accounts Receivable', category: 'Current Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1040', account_name: 'Inventory', category: 'Current Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1050', account_name: 'Prepaid Expenses', category: 'Current Asset', current_balance: 0.00, normal_balance: 'debit' },

      // Fixed Assets
      { account_code: '1200', account_name: 'Office Equipment', category: 'Fixed Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1210', account_name: 'Vehicles', category: 'Fixed Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1220', account_name: 'Furniture & Fixtures', category: 'Fixed Asset', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '1230', account_name: 'Computers & IT Equipment', category: 'Fixed Asset', current_balance: 0.00, normal_balance: 'debit' },

      // Contra-Asset
      { account_code: '1290', account_name: 'Accumulated Depreciation', category: 'Contra-Asset', current_balance: 0.00, normal_balance: 'credit' },

      // Current Liabilities
      { account_code: '2010', account_name: 'Accounts Payable', category: 'Current Liability', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '2020', account_name: 'Salaries Payable', category: 'Current Liability', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '2030', account_name: 'Taxes Payable (VAT, PAYE)', category: 'Current Liability', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '2040', account_name: 'Short-term Loan', category: 'Current Liability', current_balance: 0.00, normal_balance: 'credit' },

      // Long-term Liabilities
      { account_code: '2100', account_name: 'Bank Loan (Long-term)', category: 'Long-term Liability', current_balance: 0.00, normal_balance: 'credit' },

      // Equity
      { account_code: '3010', account_name: 'Owner\'s Capital', category: 'Equity', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '3020', account_name: 'Additional Paid-in Capital', category: 'Equity', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '3030', account_name: 'Retained Earnings', category: 'Equity', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '3040', account_name: 'Dividends Paid', category: 'Equity', current_balance: 0.00, normal_balance: 'debit' },

      // Revenue
      { account_code: '4010', account_name: 'Sales Revenue', category: 'Revenue', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '4020', account_name: 'Service Revenue', category: 'Revenue', current_balance: 0.00, normal_balance: 'credit' },
      { account_code: '4030', account_name: 'Other Income (Interest, etc.)', category: 'Revenue', current_balance: 0.00, normal_balance: 'credit' },

      // Expenses
      { account_code: '5010', account_name: 'Cost of Goods Sold', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5020', account_name: 'Salaries & Wages', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5030', account_name: 'Rent Expense', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5040', account_name: 'Utilities (Water, Power, Internet)', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5050', account_name: 'Marketing & Advertising', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5060', account_name: 'Transport & Delivery', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5070', account_name: 'Repairs & Maintenance', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5080', account_name: 'Office Supplies', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5090', account_name: 'Insurance Expense', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5100', account_name: 'Bank Charges & Interest', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
      { account_code: '5110', account_name: 'Depreciation Expense', category: 'Expense', current_balance: 0.00, normal_balance: 'debit' },
    ];

    try {
      const accountsWithUserId = defaultAccounts.map(account => ({
        ...account,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('chart_of_accounts')
        .insert(accountsWithUserId);

      if (error) {
        console.error('Error creating default accounts:', error);
      }
    } catch (error) {
      console.error('Error creating default accounts:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // If signup was successful, create default accounts
    if (!error && data.user) {
      await createDefaultAccounts(data.user.id);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
