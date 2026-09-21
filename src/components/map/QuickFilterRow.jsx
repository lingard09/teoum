import { quickFilters } from "../../data/mapFilters.js";
import "./QuickFilterRow.css";

const ICONS = {
  grid: (
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  ),
  landmark: (
    <path d="M4 21h16M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6" />
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  gauge: <path d="M4 15a8 8 0 1 1 16 0M12 15l4-5M12 15h.01" />,
  bed: <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />,
  route: <path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14-14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 15V9a4 4 0 0 1 4-4h6a4 4 0 0 0 4-4" />,
};

function FilterIcon({ name }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function QuickFilterRow({ active, onChange }) {
  return (
    <div className="quick-filter-row">
      <div className="quick-filter-row__list">
        {quickFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={active === f.id ? "quick-filter-chip is-active" : "quick-filter-chip"}
            onClick={() => onChange(f.id)}
          >
            <FilterIcon name={f.icon} />
            {f.label}
          </button>
        ))}
      </div>
      <span className="quick-filter-row__status">
        <span className="quick-filter-row__status-dot" aria-hidden="true" />
        집중률 예측 반영중
      </span>
    </div>
  );
}

export default QuickFilterRow;
