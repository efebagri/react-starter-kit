import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Server,
  Globe,
  Package,
  CreditCard,
  FileText,
  HelpCircle,
  User,
  Settings,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';

/*
CSS Variables for theming - add these to your global CSS or index.css:

:root {
  --bg: #ffffff;
  --card: #ffffff;
  --muted: #6b7280;
  --border: #e5e7eb;
  --ring: #3b82f6;
  --accent: #3b82f6;
  --accent-foreground: #ffffff;
  --success: #16a34a;
  --danger: #ef4444;
  --foreground: #0b1020;
}

.dark {
  --bg: #0b1020;
  --card: #1e293b;
  --muted: #94a3b8;
  --border: #334155;
  --ring: #6366f1;
  --accent: #6366f1;
  --accent-foreground: #ffffff;
  --success: #22c55e;
  --danger: #f43f5e;
  --foreground: #e5e7eb;
}

Usage: Add 'dark' class to <html> element to toggle dark mode
*/

export type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  active?: boolean;
  external?: boolean;
  amount?: string;
  badge?: { text: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' };
  children?: NavItem[];
  permission?: string;
};

type SidebarProps = {
  items: NavItem[];
  currentPath?: string;
  permissions?: string[];
  user: { name: string; avatarUrl?: string; balance?: string };
  tenant?: { name: string; avatarUrl?: string; balance?: string };
  isCollapsed?: boolean;
  onToggle?: (v: boolean) => void;
  className?: string;
};

const defaultItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    active: false,
  },
  {
    key: 'server',
    label: 'Server',
    icon: Server,
    children: [
      { key: 'server-overview', label: 'Overview', href: '/server' },
      { key: 'server-instances', label: 'Instances', href: '/server/instances' },
      { key: 'server-backups', label: 'Backups', href: '/server/backups' },
    ],
  },
  {
    key: 'web-domains',
    label: 'Web & Domains',
    icon: Globe,
    children: [
      { key: 'domains', label: 'Domains', href: '/domains' },
      { key: 'ssl', label: 'SSL Certificates', href: '/ssl' },
      { key: 'dns', label: 'DNS Management', href: '/dns' },
    ],
  },
  {
    key: 'products',
    label: 'Weitere Produkte',
    icon: Package,
    children: [
      { key: 'vps', label: 'VPS', href: '/vps' },
      { key: 'storage', label: 'Storage', href: '/storage' },
      { key: 'cdn', label: 'CDN', href: '/cdn' },
    ],
  },
  {
    key: 'balance',
    label: 'Guthaben',
    href: '/balance',
    icon: CreditCard,
    amount: '1000,00 €',
  },
  {
    key: 'invoices',
    label: 'Rechnungen',
    href: '/invoices',
    icon: FileText,
  },
  {
    key: 'support',
    label: 'Support',
    href: '/support',
    icon: HelpCircle,
    badge: { text: 'NEU', tone: 'danger' },
  },
];

const Tooltip: React.FC<{ children: React.ReactNode; content: string; show: boolean }> = ({
  children,
  content,
  show,
}) => (
  <div className="relative group">
    {children}
    {show && (
      <div className="absolute left-full ml-2 px-2 py-1 text-xs rounded bg-gray-900 text-white whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-200 pointer-events-none">
        {content}
      </div>
    )}
  </div>
);

const Badge: React.FC<{ text: string; tone?: string }> = ({ text, tone = 'neutral' }) => {
  const toneClasses = {
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span
      className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
        toneClasses[tone as keyof typeof toneClasses] || toneClasses.neutral
      }`}
    >
      {text}
    </span>
  );
};

const AmountPill: React.FC<{ amount: string }> = ({ amount }) => (
  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
    {amount}
  </span>
);

const NavItemComponent: React.FC<{
  item: NavItem;
  isCollapsed: boolean;
  level?: number;
  expandedItems: Set<string>;
  onToggleExpand: (key: string) => void;
}> = ({ item, isCollapsed, level = 0, expandedItems, onToggleExpand }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.key);
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      onToggleExpand(item.key);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hasChildren) {
        onToggleExpand(item.key);
      }
    }
  };

  const itemContent = (
    <div
      className={`
        flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ease-out
        ${level > 0 ? 'ml-4 pl-6 relative' : ''}
        ${
          item.active
            ? 'bg-[--accent] text-[--accent-foreground] shadow-sm'
            : 'text-[--foreground] hover:bg-[--card] hover:shadow-sm'
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2
        ${isCollapsed && level === 0 ? 'px-3 justify-center' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role={hasChildren ? 'button' : item.href ? 'link' : 'button'}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-controls={hasChildren ? `submenu-${item.key}` : undefined}
      aria-current={item.active ? 'page' : undefined}
    >
      {level > 0 && (
        <div className="absolute left-2 top-0 bottom-0 w-px bg-[--border]" />
      )}
      <div className="flex items-center min-w-0 flex-1">
        {Icon && (
          <Icon
            size={18}
            className={`flex-shrink-0 ${isCollapsed && level === 0 ? '' : 'mr-3'} ${
              item.active ? 'text-[--accent-foreground]' : 'text-[--muted]'
            }`}
          />
        )}
        {(!isCollapsed || level > 0) && (
          <span className="truncate font-medium">{item.label}</span>
        )}
      </div>
      {(!isCollapsed || level > 0) && (
        <div className="flex items-center space-x-2">
          {item.amount && <AmountPill amount={item.amount} />}
          {item.badge && <Badge text={item.badge.text} tone={item.badge.tone} />}
          {hasChildren && (
            <ChevronDown
              size={14}
              className={`text-[--muted] transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
      )}
    </div>
  );

  const content = item.href ? (
    <a href={item.href} className="block">
      {itemContent}
    </a>
  ) : (
    itemContent
  );

  return (
    <div>
      {isCollapsed && level === 0 ? (
        <Tooltip content={item.label} show={true}>
          {content}
        </Tooltip>
      ) : (
        content
      )}
      {hasChildren && isExpanded && (!isCollapsed || level > 0) && (
        <div
          id={`submenu-${item.key}`}
          className="mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-out"
        >
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.key}
              item={child}
              isCollapsed={isCollapsed}
              level={level + 1}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AccountCard: React.FC<{
  tenant?: { name: string; avatarUrl?: string; balance?: string };
  isCollapsed: boolean;
}> = ({ tenant, isCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!tenant || isCollapsed) return null;

  return (
    <div className="relative">
      <button
        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-[--card] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-full bg-[--accent] flex items-center justify-center text-[--accent-foreground] font-medium text-sm">
          {tenant.avatarUrl ? (
            <img src={tenant.avatarUrl} alt={tenant.name} className="w-full h-full rounded-full" />
          ) : (
            tenant.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium text-[--foreground] text-sm">{tenant.name}</div>
          {tenant.balance && (
            <div className="text-xs text-[--muted]">{tenant.balance}</div>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-[--muted] transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[--card] border border-[--border] rounded-xl shadow-lg py-1">
          <button className="w-full px-3 py-2 text-left text-sm text-[--foreground] hover:bg-[--accent] hover:text-[--accent-foreground] transition-colors">
            Switch Account
          </button>
          <button className="w-full px-3 py-2 text-left text-sm text-[--foreground] hover:bg-[--accent] hover:text-[--accent-foreground] transition-colors">
            Settings
          </button>
          <hr className="my-1 border-[--border]" />
          <button className="w-full px-3 py-2 text-left text-sm text-[--danger] hover:bg-[--danger] hover:text-white transition-colors">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const UserSwitcher: React.FC<{
  user: { name: string; avatarUrl?: string; balance?: string };
  isCollapsed: boolean;
}> = ({ user, isCollapsed }) => (
  <div className="flex items-center justify-between p-3">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-[--accent] flex items-center justify-center text-[--accent-foreground] font-medium text-sm">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>
      {!isCollapsed && (
        <div className="font-medium text-[--foreground] text-sm">{user.name}</div>
      )}
    </div>
    {!isCollapsed && (
      <div className="flex items-center space-x-1">
        <Tooltip content="Settings" show={true}>
          <button
            className="p-1.5 rounded-lg hover:bg-[--card] text-[--muted] hover:text-[--foreground] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Switch User" show={true}>
          <button
            className="p-1.5 rounded-lg hover:bg-[--card] text-[--muted] hover:text-[--foreground] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
            aria-label="Switch User"
          >
            <ArrowLeftRight size={16} />
          </button>
        </Tooltip>
      </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({
  items = defaultItems,
  currentPath,
  permissions = [],
  user,
  tenant,
  isCollapsed: controlledIsCollapsed,
  onToggle,
  className = '',
}) => {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isCollapsed = controlledIsCollapsed ?? internalIsCollapsed;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(internalIsCollapsed));
    }
  }, [internalIsCollapsed]);

  // Filter items by permissions
  const filteredItems = items.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  // Set active states based on currentPath
  const itemsWithActiveState = filteredItems.map((item) => ({
    ...item,
    active: currentPath ? item.href === currentPath : item.active,
    children: item.children?.map((child) => ({
      ...child,
      active: currentPath ? child.href === currentPath : child.active,
    })),
  }));

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    if (onToggle) {
      onToggle(newCollapsed);
    } else {
      setInternalIsCollapsed(newCollapsed);
    }
  };

  const handleToggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const produkteItems = itemsWithActiveState.slice(0, 4);
  const verwaltungItems = itemsWithActiveState.slice(4);

  return (
    <div
      className={`
        flex flex-col h-full bg-[--bg] border-r border-[--border] transition-all duration-300 ease-out
        ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-[--accent] flex items-center justify-center">
              <span className="text-[--accent-foreground] font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-[--foreground]">Logo</span>
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-[--card] text-[--muted] hover:text-[--foreground] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* PRODUKTE Section */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-[--muted] tracking-wide uppercase mb-3">
              PRODUKTE
            </h2>
          )}
          <nav className="space-y-1" role="navigation" aria-label="Products">
            {produkteItems.map((item) => (
              <NavItemComponent
                key={item.key}
                item={item}
                isCollapsed={isCollapsed}
                expandedItems={expandedItems}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </nav>
        </div>

        {/* VERWALTUNG Section */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-[--muted] tracking-wide uppercase mb-3">
              VERWALTUNG
            </h2>
          )}
          <nav className="space-y-1" role="navigation" aria-label="Management">
            {verwaltungItems.map((item) => (
              <NavItemComponent
                key={item.key}
                item={item}
                isCollapsed={isCollapsed}
                expandedItems={expandedItems}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[--border] bg-[--bg]">
        <AccountCard tenant={tenant} isCollapsed={isCollapsed} />
        <UserSwitcher user={user} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;