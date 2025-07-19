"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Wallet, Settings } from 'lucide-react';
import { mobileNavStyles } from '../lib/styles/mobile-navigation';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className={mobileNavStyles.container}>
      <nav className={mobileNavStyles.nav}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${mobileNavStyles.navItem} ${
                isActive ? mobileNavStyles.activeNavItem : ''
              } group`}
            >
              <Icon
                className={`${mobileNavStyles.navIcon} ${
                  isActive ? mobileNavStyles.activeNavIcon : ''
                }`}
              />
              <span
                className={`${mobileNavStyles.navLabel} ${
                  isActive ? mobileNavStyles.activeNavLabel : ''
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
