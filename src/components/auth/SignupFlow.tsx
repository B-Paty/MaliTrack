import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Package } from 'lucide-react';
import { useAuth } from './AuthProvider';
import InventorySetup from './InventorySetup';
import { ProductType } from './AuthProvider';

interface SignupFlowProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function SignupFlow({ onSuccess, onBack }: SignupFlowProps) {
  const [step, setStep] = useState<'signup' | 'inventory'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const { signUp, createInventorySettings } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Get the current user from auth context
        setUser({ email });
        setStep('inventory');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryComplete = async (inventoryType: 'single' | 'multiple', products?: ProductType[]) => {
    setLoading(true);
    try {
      // Update inventory settings if user chose multiple inventory
      if (inventoryType === 'multiple' && products && products.length > 0) {
        // This would be called after the user is authenticated
        // For now, we'll just proceed to success
      }
      onSuccess();
    } catch (err) {
      setError('Failed to complete inventory setup');
    } finally {
      setLoading(false);
    }
  };

  const handleInventorySkip = () => {
    onSuccess();
  };

  if (step === 'inventory') {
    return (
      <InventorySetup
        onComplete={handleInventoryComplete}
        onSkip={handleInventorySkip}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start managing your business finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onBack} className="text-sm">
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
