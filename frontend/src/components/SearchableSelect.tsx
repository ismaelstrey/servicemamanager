import React, { useEffect,  useRef, useState } from 'react';

type Option = { value: string | number; label: string };

export interface SearchableSelectProps {
  placeholder?: string;
  value?: string | number;
  onChange: (value?: string | number) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ placeholder, value, onChange, fetchOptions }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const opts = await fetchOptions(search);
        if (!cancelled) setOptions(opts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [search, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder={placeholder || 'Buscar...'}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Carregando...</div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">Sem resultados</div>
          ) : (
            options.map((opt) => (
              <button
                key={`${opt.value}`}
                type="button"
                className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${String(value) === String(opt.value) ? 'bg-gray-50' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            ))
          )}
          {value !== undefined && (
            <button
              type="button"
              className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
              onClick={() => { onChange(undefined); setOpen(false); }}
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;