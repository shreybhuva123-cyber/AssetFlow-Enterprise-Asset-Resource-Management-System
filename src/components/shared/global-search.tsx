'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ assets: { id: string; name: string; assetTag: string; status: string }[]; employees: { id: string; displayName: string; email: string }[]; departments: { id: string; name: string }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search assets, people, departments..."
          className="w-full pl-9 bg-background/50 border-muted-foreground/20 rounded-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results) setIsOpen(true); }}
        />
        {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        {!loading && query && (
          <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => { setQuery(''); setResults(null); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full max-w-md bg-background border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.assets.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground px-2 py-1 flex items-center gap-2">
                  <Package className="h-3 w-3" /> ASSETS
                </div>
                {results.assets.map(a => (
                  <Link key={a.id} href={`/assets/${a.id}`} onClick={() => setIsOpen(false)} className="flex flex-col px-2 py-2 hover:bg-muted rounded-md">
                    <span className="font-medium text-sm">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.assetTag} • {a.status}</span>
                  </Link>
                ))}
              </div>
            )}
            
            {results.employees.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-semibold text-muted-foreground px-2 py-1 flex items-center gap-2">
                  <Users className="h-3 w-3" /> PEOPLE
                </div>
                {results.employees.map(e => (
                  <Link key={e.id} href={`/employees/${e.id}`} onClick={() => setIsOpen(false)} className="flex flex-col px-2 py-2 hover:bg-muted rounded-md">
                    <span className="font-medium text-sm">{e.displayName}</span>
                    <span className="text-xs text-muted-foreground">{e.email}</span>
                  </Link>
                ))}
              </div>
            )}

            {results.assets.length === 0 && results.employees.length === 0 && results.departments.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
