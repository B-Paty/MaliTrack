/**
 * SecurityDashboard
 * Displays data leak detection monitoring and security alerts.
 * - Shows audit trail and access patterns
 * - Displays active security alerts
 * - Provides leak detection controls
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Scan
} from 'lucide-react';
import { useLeakDetection } from '@/hooks/useLeakDetection';
import { formatDistanceToNow } from 'date-fns';

export default function SecurityDashboard() {
  const {
    auditLogs,
    leakAlerts,
    stats,
    loading,
    runLeakDetection,
    resolveAlert,
  } = useLeakDetection();
  
  const [scanning, setScanning] = useState(false);

  const handleLeakScan = async () => {
    setScanning(true);
    try {
      await runLeakDetection();
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor data access and detect potential leaks</p>
        </div>
        <Button 
          onClick={handleLeakScan} 
          disabled={scanning}
          className="gap-2"
        >
          <Scan className="h-4 w-4" />
          {scanning ? 'Scanning...' : 'Run Leak Scan'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalAccess}</p>
                <p className="text-sm text-muted-foreground">Total Access (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.highRiskAccess}</p>
                <p className="text-sm text-muted-foreground">High Risk Access</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className={`h-8 w-8 ${getRiskScoreColor(stats.riskScore)}`} />
              <div>
                <p className={`text-2xl font-bold ${getRiskScoreColor(stats.riskScore)}`}>
                  {stats.riskScore}
                </p>
                <p className="text-sm text-muted-foreground">Risk Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Score Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Risk Level
          </CardTitle>
          <CardDescription>
            Overall risk assessment based on recent activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Risk Score</span>
              <span className={getRiskScoreColor(stats.riskScore)}>{stats.riskScore}/100</span>
            </div>
            <Progress 
              value={stats.riskScore} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Security Alerts
            {stats.activeAlerts > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.activeAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Eye className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {leakAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All Clear</h3>
                <p className="text-muted-foreground">No security alerts detected</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leakAlerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-semibold">{alert.title}</span>
                          {alert.is_resolved && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at))} ago
                        </p>
                      </div>
                      {!alert.is_resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Data Access</CardTitle>
              <CardDescription>
                Detailed log of all data access operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No audit logs available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.risk_score >= 50 ? 'bg-red-500' : 
                          log.risk_score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">
                            {log.operation} on {log.table_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.accessed_at))} ago
                            {log.record_count > 1 && (
                              <span>• {log.record_count} records</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={getRiskScoreColor(log.risk_score)}
                        >
                          Risk: {log.risk_score}
                        </Badge>
                        {Object.keys(log.suspicious_flags).length > 0 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
