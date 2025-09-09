import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Lock } from 'lucide-react';

import { type NavItem } from '@/types';
import { Button } from '@/components/ui/button';

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/app/dashboard', icon: LayoutGrid },
    { title: 'Admin', href: '/admin/dashboard', icon: Lock },
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder },
    { title: 'Docs', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function HomepageHeader() {
    return (
        <header className="bg-gradient-to-r from-black via-gray-900 to-black/80 backdrop-blur-md text-white shadow">
            <div className="container mx-auto flex items-center justify-between px-6 py-3 md:py-4">
                {/* Logo */}
                <Link href="/" prefetch className="flex items-center gap-3 text-xl font-semibold tracking-wide">
                    <span>MyApp</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2 lg:gap-4">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-white hover:text-purple-300 hover:bg-white/10 dark:hover:bg-white/5 transition"
                        >
                            <Link
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                className="flex items-center gap-2"
                            >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span className="hidden sm:inline">{item.title}</span>
                            </Link>
                        </Button>
                    ))}
                </nav>

                {/* Mobile menu placeholder */}
                <div className="md:hidden">
                    {/* Optional: A mobile menu button */}
                    <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        {/* Hamburger Icon or similar */}
                        ☰
                    </Button>
                </div>
            </div>
        </header>
    );
}
