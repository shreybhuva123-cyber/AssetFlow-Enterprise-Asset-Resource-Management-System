'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

import { cn } from '@/lib/utils/cn';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  href?: string;
  action?: () => void;
  group: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const items: CommandItem[] = React.useMemo(() => {
    const base: CommandItem[] = [
      { id: 'dash', group: 'Navigate', label: 'Dashboard', href: '/dashboard' },
      { id: 'employees', group: 'Navigate', label: 'Employees', description: 'View employee directory', href: '/dashboard/employees' },
      { id: 'departments', group: 'Navigate', label: 'Departments', href: '/dashboard/departments' },
      { id: 'categories', group: 'Navigate', label: 'Asset Categories', href: '/dashboard/categories' },
      { id: 'settings', group: 'Navigate', label: 'Settings', href: '/dashboard/settings' },
    ];

    return base;
  }, [profile]);

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q),
    );
  }, [items, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return map;
  }, [filtered]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleSelect(item: CommandItem) {
    onClose();
    if (item.href) router.push(item.href);
    else item.action?.();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = filtered[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent size="md" hideClose className="p-0 overflow-hidden gap-0">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands…"
            className="flex h-12 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Command palette search"
            role="combobox"
            aria-expanded={open}
            aria-controls="command-list"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          id="command-list"
          role="listbox"
          className="max-h-80 overflow-y-auto p-2"
          aria-label="Commands"
        >
          {groups.size === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
          ) : (
            Array.from(groups.entries()).map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group}
                </p>
                {groupItems.map((item) => {
                  const isActive = flatIndex === activeIndex;
                  const currentIndex = flatIndex++;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-left',
                        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                      )}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      onClick={() => handleSelect(item)}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
          <span><kbd className="rounded border px-1 py-0.5 font-mono text-xs">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border px-1 py-0.5 font-mono text-xs">↵</kbd> select</span>
          <span><kbd className="rounded border px-1 py-0.5 font-mono text-xs">esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
