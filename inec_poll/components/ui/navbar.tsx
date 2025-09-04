'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          INEC Poll
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/polls" className={`${pathname.startsWith('/polls') && pathname !== '/polls/create' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
            View Polls
          </Link>
          <Link href="/polls/create" className={`${pathname === '/polls/create' ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
            Create Poll
          </Link>
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Login / Signup
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}