/**
 * useLeakDetection
 * Monitors data access patterns and detects potential data leaks.
 * - Tracks user activity and generates risk scores
 * - Provides leak alerts and audit trail
 * - Integrates with all data access operations
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  user_id: string;
  table_name: string;
  operation: string;
  record_id?: string;
  record_count: number;
  risk_score: number;
  suspicious_flags: Record<string, unknown>;
  accessed_at: string;
}

export interface LeakAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface LeakDetectionStats {
  totalAccess: number;
  highRiskAccess: number;
  activeAlerts: number;
  riskScore: number;
}

export function useLeakDetection() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [leakAlerts, setLeakAlerts] = useState<LeakAlert[]>([]);
  const [stats, setStats] = useState<LeakDetectionStats>({
    totalAccess: 0,
    highRiskAccess: 0,
    activeAlerts: 0,
    riskScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Log data access for audit trail
  const logDataAccess = useCallback(async (
    tableName: string, 
    operation: string, 
    recordId?: string, 
    recordCount: number = 1
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_data_access', {
        p_table_name: tableName,
        p_operation: operation,
        p_record_id: recordId,
        p_record_count: recordCount
      });
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
  }, [user]);

  // Fetch audit logs for current user
  const fetchAuditLogs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs((data || []).map(log => ({ 
        ...log, 
        suspicious_flags: log.suspicious_flags || {} 
      })));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, [user]);

  // Fetch leak alerts for current user
  const fetchLeakAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leak_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeakAlerts((data || []).map(alert => ({ 
        ...alert,
        severity: alert.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        metadata: alert.metadata || {}
      })));
    } catch (error) {
      console.error('Failed to fetch leak alerts:', error);
    }
  }, [user]);

  // Calculate detection statistics
  const calculateStats = useCallback(() => {
    const recentLogs = auditLogs.filter(log => 
      new Date(log.accessed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const totalAccess = recentLogs.length;
    const highRiskAccess = recentLogs.filter(log => log.risk_score >= 50).length;
    const activeAlerts = leakAlerts.filter(alert => !alert.is_resolved).length;
    const avgRiskScore = totalAccess > 0 
      ? Math.round(recentLogs.reduce((sum, log) => sum + log.risk_score, 0) / totalAccess)
      : 0;

    setStats({
      totalAccess,
      highRiskAccess,
      activeAlerts,
      riskScore: avgRiskScore
    });
  }, [auditLogs, leakAlerts]);

  // Run leak detection scan
  const runLeakDetection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('detect_data_leaks');
      
      if (error) throw error;

      // Show toast for any new critical alerts
      const criticalLeaks = data?.filter((leak: { severity: string }) => leak.severity === 'CRITICAL') || [];
      if (criticalLeaks.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Critical Security Alert',
          description: `${criticalLeaks.length} potential data leak(s) detected. Please review immediately.`,
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to run leak detection:', error);
      throw error;
    }
  };

  // Resolve a leak alert
  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('leak_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;

      // Refresh alerts
      await fetchLeakAlerts();

      toast({
        title: 'Alert Resolved',
        description: 'Security alert has been marked as resolved.',
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resolve alert. Please try again.',
      });
    }
  };

  // Initialize and fetch data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const initialize = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAuditLogs(),
          fetchLeakAlerts()
        ]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user, fetchAuditLogs, fetchLeakAlerts]);

  // Recalculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Set up real-time subscriptions for alerts
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('leak_alerts')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'leak_alerts',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const newAlert = payload.new as LeakAlert;
          setLeakAlerts(prev => [newAlert, ...prev]);
          
          // Show toast for new alerts
          if (newAlert.severity === 'CRITICAL' || newAlert.severity === 'HIGH') {
            toast({
              variant: 'destructive',
              title: `${newAlert.severity} Security Alert`,
              description: newAlert.title,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  return {
    auditLogs,
    leakAlerts,
    stats,
    loading,
    logDataAccess,
    fetchAuditLogs,
    fetchLeakAlerts,
    runLeakDetection,
    resolveAlert,
  };
}
