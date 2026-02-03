'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, CalendarDays, Scroll, User } from 'lucide-react';

const navItems = [
    { href: '/', label: 'To Do', icon: ListTodo },
    { href: '/quests', label: 'Quests', icon: Scroll },
    { href: '/tracker', label: 'Tracker', icon: CalendarDays },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-40 md:hidden"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
            }}
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px] min-h-[48px]
                transition-all duration-150
                ${isActive
                                    ? 'text-indigo-400'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                }
              `}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]' : ''}`} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
