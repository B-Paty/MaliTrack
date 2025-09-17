/**
 * LoginForm
 * Email/password login form with validation and error handling.
 * - Toggles between login and signup modes
 * - Shows loading states and error messages
 * - Uses QSA branding and styling
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Lock, Mail, User, Building2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useEnhancedCompanySettings } from '@/hooks/useEnhancedCompanySettings';
import SignupFlow from './SignupFlow';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const { settings, getLogoForContext } = useEnhancedCompanySettings();

  // Get company branding
  const companyName = settings?.company_name || 'QSA Solutions';
  const companyLogo = getLogoForContext('preview');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
  };

  // Show SignupFlow when in signup mode
  if (isSignUp) {
    return (
      <SignupFlow
        onSuccess={() => {
          setIsSignUp(false);
          setMessage('Account created successfully! Please sign in.');
        }}
        onBack={() => setIsSignUp(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 sm:mx-6">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-6">
            {/* Company Logo */}
            {companyLogo ? (
              <div className="flex-shrink-0">
                <img
                  src={companyLogo}
                  alt={`${companyName} Logo`}
                  className="h-12 w-auto max-w-[120px] object-contain"
                  onError={(e) => {
                    // Fallback to icon if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback Icon (hidden by default) */}
                <div className="hidden h-12 w-12 bg-primary rounded-lg items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            ) : (
              /* Default Icon when no logo */
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-semibold">
            Welcome to {companyName}
          </CardTitle>
          <CardDescription>
            Sign in to access your accounting dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?
            </p>
            <Button
              variant="outline"
              onClick={toggleMode}
              disabled={loading}
              className="w-full"
            >
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
