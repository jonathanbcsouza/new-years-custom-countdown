import { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllTimezones, formatTimezone } from '@/lib/timezones';
import { cn } from '@/lib/utils';

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

/**
 * Timezone selector component with search-friendly dropdown
 */
export function TimezoneSelector({
  value,
  onChange,
  className,
}: TimezoneSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const timezones = useMemo(() => getAllTimezones(), []);

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) {
      return timezones;
    }

    const query = searchQuery.toLowerCase();
    return timezones.filter((tz) => {
      const formatted = formatTimezone(tz).toLowerCase();
      const parts = tz.toLowerCase().split('/');
      return (
        formatted.includes(query) || parts.some((part) => part.includes(query))
      );
    });
  }, [timezones, searchQuery]);

  // Group timezones by region for better organization
  const groupedTimezones = useMemo(() => {
    const groups: Record<string, string[]> = {};

    filteredTimezones.forEach((tz) => {
      const [region] = tz.split('/');
      if (!groups[region]) {
        groups[region] = [];
      }
      groups[region].push(tz);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, tzs]) => ({
        region,
        timezones: tzs.sort(),
      }));
  }, [filteredTimezones]);

  const currentLabel = formatTimezone(value);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[280px] md:w-[320px] h-9 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Select timezone">
              <span className="truncate">{currentLabel}</span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[400px] w-[var(--radix-select-trigger-width)]">
          <div className="sticky top-0 z-10 bg-popover border-b p-2">
            <input
              type="text"
              placeholder="Search timezone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {groupedTimezones.length > 0 ? (
              groupedTimezones.map(({ region, timezones: tzs }) => (
                <div key={region} className="py-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover">
                    {region}
                  </div>
                  {tzs.map((tz) => {
                    const label = formatTimezone(tz);
                    return (
                      <SelectItem key={tz} value={tz}>
                        <span className="truncate">{label}</span>
                      </SelectItem>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No timezones found
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
