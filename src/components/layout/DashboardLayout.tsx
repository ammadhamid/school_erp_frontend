import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  Bell,
  UserCog,
  Wallet,
  BarChart3,
  Settings,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
  children?: { title: string; path: string }[];
}

const getUserRole = (): string => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.role || 'MANAGER';
  } catch {
    return 'MANAGER';
  }
};

const allMenuItems: (MenuItem & { roles?: string[] })[] = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    title: 'Students',
    icon: Users,
    path: '/students',
    children: [
      { title: 'All Students', path: '/students' },
      { title: 'Add Student', path: '/students/add' },
    ],
  },
  { title: 'Admissions', icon: UserPlus, path: '/admissions' },
  {
    title: 'Fees & Billing',
    icon: DollarSign,
    path: '/fees',
    roles: ['ADMIN'],
    children: [
      { title: 'Collect Fee', path: '/fees/collect' },
      { title: 'Fee Configuration', path: '/fees/config' },
      { title: 'Student Ledger', path: '/fees/ledger' },
      { title: 'Fee Vouchers', path: '/fees/vouchers' },
      { title: 'Salary Structures', path: '/fees/salary-structures' },
      { title: 'Reports', path: '/fees/reports' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    path: '/notifications',
    roles: ['ADMIN'],
    children: [
      { title: 'WhatsApp', path: '/notifications/whatsapp' },
      { title: 'Bulk Messaging', path: '/notifications/bulk' },
      { title: 'Logs', path: '/notifications/logs' },
    ],
  },
  { title: 'Staff', icon: UserCog, path: '/staff', roles: ['ADMIN'] },
  { title: 'Payroll', icon: Wallet, path: '/payroll', roles: ['ADMIN'] },
  { title: 'Reports & Analytics', icon: BarChart3, path: '/reports' },
  { title: 'Settings', icon: Settings, path: '/settings', roles: ['ADMIN'] },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const userRole = getUserRole();
  const menuItems = allMenuItems.filter(item => !item.roles || item.roles.includes(userRole));

  const isActive = (path: string) => location.pathname === path;
  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u?.name || 'User';
    } catch { return 'User'; }
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2 animate-fade-in">
              <GraduationCap className="h-8 w-8 text-sidebar-primary" />
              <span className="font-bold text-lg">Abroad School</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (item.children) {
              return (
                <DropdownMenu key={item.path}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        active && 'bg-sidebar-accent text-sidebar-primary font-medium'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', sidebarOpen ? 'mr-3' : 'mr-0')} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-48">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.path} asChild>
                        <Link to={child.path}>{child.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    active && 'bg-sidebar-accent text-sidebar-primary font-medium'
                  )}
                >
                  <Icon className={cn('h-5 w-5', sidebarOpen ? 'mr-3' : 'mr-0')} />
                  {sidebarOpen && <span>{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 border-b bg-card px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/login" onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                  }}>Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>

        {/* Footer */}
        <footer className="mt-auto border-t bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Developed by <span className="font-medium">MKH Digital Solutions</span> | © 2025
            Abroad Schooling System. All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
