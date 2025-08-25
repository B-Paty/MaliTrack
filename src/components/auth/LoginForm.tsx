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

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
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

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for a confirmation link');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
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
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-3 sm:p-4">
      <Card className="w-full max-w-md shadow-premium border-0 bg-gradient-secondary/50 mx-2 sm:mx-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Company Logo */}
            {companyLogo ? (
              <div className="flex-shrink-0">
                <img
                  src={companyLogo}
                  alt={`${companyName} Logo`}
                  className="h-10 w-10 sm:h-12 sm:w-auto max-w-[120px] object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to icon if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback Icon (hidden by default) */}
                <div className="hidden h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
                </div>
              </div>
            ) : (
              /* Default Icon when no logo */
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-5 w-5 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {companyName}
              </h1>
              <p className="text-sm text-muted-foreground">Accounting System</p>
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp 
              ? 'Sign up to access your accounting dashboard' 
              : 'Sign in to access your accounting dashboard'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 h-11"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-primary hover:shadow-glow transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={toggleMode}
              disabled={loading}
              className="text-primary hover:text-primary-hover font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Secure access to your financial data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
