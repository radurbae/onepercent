'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Today' },
    { href: '/quests', label: 'Quests' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/profile', label: 'Profile' },
];

export default function TopNav() {
    const pathname = usePathname();

    return (
        <header
            className="hidden md:block fixed top-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800 z-40"
        >
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
                    <span className="text-xl">⚔️</span>
                    <span>1% Better</span>
                </Link>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'text-indigo-400 bg-indigo-500/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }
                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    <Link
                        href="/new"
                        className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        New
                    </Link>
                </nav>
            </div>
        </header>
    );
}
