'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="btn-outline text-xs py-1.5 inline-flex items-center gap-1.5"
    >
      <LogOut size={12} />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
