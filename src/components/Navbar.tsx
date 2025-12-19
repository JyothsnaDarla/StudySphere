import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import ProfileDropdown from './ProfileDropdown';
import { supabase } from '@/integrations/supabase/client';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <BookOpen className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold gradient-text">Study Sphere</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/study-materials"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/study-materials') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Study Materials
            </Link>
            <Link
              to="/quizzes"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/quizzes') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Quizzes
            </Link>
            <Link
              to="/news"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/news') ? 'text-primary' : 'text-foreground'
              }`}
            >
              News
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-warning" />
              )}
            </button>

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
