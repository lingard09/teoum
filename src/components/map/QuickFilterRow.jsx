import { quickFilters } from "../../data/mapFilters.js";
import "./QuickFilterRow.css";

const ICONS = {
  grid: (
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  ),
  gauge: <path d="M4 15a8 8 0 1 1 16 0M12 15l4-5M12 15h.01" />,
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
