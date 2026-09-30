import React from 'react';
import { Key, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface SchemaGraphSVGProps {
  className?: string;
  onTableSelect?: (tableName: 'customers' | 'orders' | 'order_items') => void;
  activeTable?: 'customers' | 'orders' | 'order_items';
}

export const SchemaGraphSVG: React.FC<SchemaGraphSVGProps> = ({
  className = '',
  onTableSelect,
  activeTable = 'customers',
}) => {
  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border border-brand-border bg-white shadow-micro ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Relational Schema Topology
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-brand-teal border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-brand-teal" />
            Referential Integrity: 100% Valid
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-brand-secondary">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Key className="w-3 h-3 text-amber-500" /> PK = Primary Key
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <LinkIcon className="w-3 h-3 text-cyan-600" /> FK = Foreign Key
          </span>
        </div>
      </div>

      {/* SVG Canvas with 3 interconnected schema nodes */}
      <div className="relative w-full overflow-x-auto py-2">
        <svg
          viewBox="0 0 820 220"
          className="w-full h-auto min-w-[760px] select-none"
        >
          <defs>
            <marker
              id="arrow-teal"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0D9488" />
            </marker>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0284C7" />
            </marker>
            <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="linkGradCyan" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Connection Line 1: Customers (right: 220, y: 110) -> Orders (left: 310, y: 110) */}
          <path
            d="M 220 110 C 265 110, 265 110, 304 110"
            fill="none"
            stroke="url(#linkGrad)"
            strokeWidth="2"
            strokeDasharray="4 2"
            markerEnd="url(#arrow-teal)"
          />
          {/* Cardinality badge 1:N */}
          <rect x="250" y="96" width="30" height="18" rx="4" fill="#E6F4F1" stroke="#99F6E4" />
          <text x="265" y="109" textAnchor="middle" fill="#0F766E" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
            1:N
          </text>

          {/* Connection Line 2: Orders (right: 530, y: 110) -> Order Items (left: 620, y: 110) */}
          <path
            d="M 530 110 C 575 110, 575 110, 614 110"
            fill="none"
            stroke="url(#linkGradCyan)"
            strokeWidth="2"
            strokeDasharray="4 2"
            markerEnd="url(#arrow-cyan)"
          />
          {/* Cardinality badge 1:N */}
          <rect x="560" y="96" width="30" height="18" rx="4" fill="#E0F2FE" stroke="#BAE6FD" />
          <text x="575" y="109" textAnchor="middle" fill="#0369A1" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
            1:N
          </text>

          {/* NODE 1: Customers */}
          <g
            className="cursor-pointer transition-all hover:opacity-95"
            onClick={() => onTableSelect && onTableSelect('customers')}
          >
            <rect
              x="20"
              y="20"
              width="200"
              height="180"
              rx="8"
              fill="#FFFFFF"
              stroke={activeTable === 'customers' ? '#0D9488' : '#CBD5E1'}
              strokeWidth={activeTable === 'customers' ? '2' : '1'}
              filter="drop-shadow(0 2px 4px rgba(15,23,42,0.06))"
            />
            {/* Header */}
            <rect x="20" y="20" width="200" height="34" rx="8" fill="#F8FAFC" />
            <line x1="20" y1="54" x2="220" y2="54" stroke="#E2E8F0" strokeWidth="1" />
            <text x="32" y="42" fill="#1C1D1F" fontSize="13" fontWeight="600" fontFamily="Inter">
              customers
            </text>
            <text x="195" y="42" textAnchor="end" fill="#6F7988" fontSize="10" fontFamily="JetBrains Mono">
              table
            </text>

            {/* Field: customer_id (PK) */}
            <rect x="28" y="64" width="22" height="15" rx="3" fill="#FEF3C7" />
            <text x="39" y="75" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              PK
            </text>
            <text x="56" y="76" fill="#1C1D1F" fontSize="12" fontWeight="500" fontFamily="JetBrains Mono">
              customer_id
            </text>
            <text x="210" y="76" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              int
            </text>

            {/* Field: name */}
            <text x="36" y="104" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              name
            </text>
            <text x="210" y="104" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              varchar
            </text>

            {/* Field: email */}
            <text x="36" y="132" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              email
            </text>
            <text x="210" y="132" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              varchar
            </text>

            {/* Field: country */}
            <text x="36" y="160" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              country
            </text>
            <text x="210" y="160" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              varchar
            </text>

            {/* Field: tier */}
            <text x="36" y="186" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              tier
            </text>
            <text x="210" y="186" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              enum
            </text>
          </g>

          {/* NODE 2: Orders */}
          <g
            className="cursor-pointer transition-all hover:opacity-95"
            onClick={() => onTableSelect && onTableSelect('orders')}
          >
            <rect
              x="310"
              y="20"
              width="220"
              height="180"
              rx="8"
              fill="#FFFFFF"
              stroke={activeTable === 'orders' ? '#0D9488' : '#CBD5E1'}
              strokeWidth={activeTable === 'orders' ? '2' : '1'}
              filter="drop-shadow(0 2px 4px rgba(15,23,42,0.06))"
            />
            {/* Header */}
            <rect x="310" y="20" width="220" height="34" rx="8" fill="#F8FAFC" />
            <line x1="310" y1="54" x2="530" y2="54" stroke="#E2E8F0" strokeWidth="1" />
            <text x="322" y="42" fill="#1C1D1F" fontSize="13" fontWeight="600" fontFamily="Inter">
              orders
            </text>
            <text x="515" y="42" textAnchor="end" fill="#6F7988" fontSize="10" fontFamily="JetBrains Mono">
              table
            </text>

            {/* Field: order_id (PK) */}
            <rect x="318" y="64" width="22" height="15" rx="3" fill="#FEF3C7" />
            <text x="329" y="75" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              PK
            </text>
            <text x="346" y="76" fill="#1C1D1F" fontSize="12" fontWeight="500" fontFamily="JetBrains Mono">
              order_id
            </text>
            <text x="520" y="76" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              uuid
            </text>

            {/* Field: customer_id (FK) */}
            <rect x="318" y="92" width="22" height="15" rx="3" fill="#E0F2FE" />
            <text x="329" y="103" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              FK
            </text>
            <text x="346" y="104" fill="#0284C7" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
              customer_id
            </text>
            <text x="520" y="104" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              int
            </text>

            {/* Field: order_date */}
            <text x="326" y="132" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              order_date
            </text>
            <text x="520" y="132" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              date
            </text>

            {/* Field: total_amount */}
            <text x="326" y="160" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              total_amount
            </text>
            <text x="520" y="160" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              decimal
            </text>

            {/* Field: status */}
            <text x="326" y="186" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              status
            </text>
            <text x="520" y="186" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              varchar
            </text>
          </g>

          {/* NODE 3: Order Items */}
          <g
            className="cursor-pointer transition-all hover:opacity-95"
            onClick={() => onTableSelect && onTableSelect('order_items')}
          >
            <rect
              x="620"
              y="20"
              width="180"
              height="180"
              rx="8"
              fill="#FFFFFF"
              stroke={activeTable === 'order_items' ? '#0D9488' : '#CBD5E1'}
              strokeWidth={activeTable === 'order_items' ? '2' : '1'}
              filter="drop-shadow(0 2px 4px rgba(15,23,42,0.06))"
            />
            {/* Header */}
            <rect x="620" y="20" width="180" height="34" rx="8" fill="#F8FAFC" />
            <line x1="620" y1="54" x2="800" y2="54" stroke="#E2E8F0" strokeWidth="1" />
            <text x="632" y="42" fill="#1C1D1F" fontSize="13" fontWeight="600" fontFamily="Inter">
              order_items
            </text>
            <text x="785" y="42" textAnchor="end" fill="#6F7988" fontSize="10" fontFamily="JetBrains Mono">
              table
            </text>

            {/* Field: item_id (PK) */}
            <rect x="628" y="64" width="22" height="15" rx="3" fill="#FEF3C7" />
            <text x="639" y="75" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              PK
            </text>
            <text x="656" y="76" fill="#1C1D1F" fontSize="12" fontWeight="500" fontFamily="JetBrains Mono">
              item_id
            </text>
            <text x="790" y="76" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              uuid
            </text>

            {/* Field: order_id (FK) */}
            <rect x="628" y="92" width="22" height="15" rx="3" fill="#E0F2FE" />
            <text x="639" y="103" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              FK
            </text>
            <text x="656" y="104" fill="#0284C7" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
              order_id
            </text>
            <text x="790" y="104" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              uuid
            </text>

            {/* Field: sku */}
            <text x="636" y="132" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              sku
            </text>
            <text x="790" y="132" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              varchar
            </text>

            {/* Field: quantity */}
            <text x="636" y="160" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              quantity
            </text>
            <text x="790" y="160" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              int
            </text>

            {/* Field: amount */}
            <text x="636" y="186" fill="#475569" fontSize="12" fontFamily="JetBrains Mono">
              amount
            </text>
            <text x="790" y="186" textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">
              decimal
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
