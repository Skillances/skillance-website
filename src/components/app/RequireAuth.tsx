import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface RequireAuthButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

/** Runs action if authenticated; otherwise sends guest to login with return path. */
export function RequireAuthButton({
  children,
  className,
  variant = 'default',
}: RequireAuthButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => {
        if (isAuthenticated) {
          return;
        }
        navigate('/app/login', { state: { from: location } });
      }}
    >
      {children}
    </Button>
  );
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (callback: () => void) => {
    if (!isAuthenticated) {
      navigate('/app/login', { state: { from: location } });
      return;
    }
    callback();
  };
}
