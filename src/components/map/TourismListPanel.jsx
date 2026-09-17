import { useState, useRef, useEffect } from "react";
import { sortOptions } from "../../data/mapFilters.js";
import TourismListItem from "./TourismListItem.jsx";
import "./TourismListPanel.css";

function SortDropdown({ sortBy, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = sortOptions.find((o) => o.id === sortBy);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        {current?.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul role="listbox">
          {sortOptions.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                className={opt.id === sortBy ? "is-selected" : ""}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TourismListPanel({ villages, sortBy, onSortChange, activeId, onSelect }) {
  return (
    <aside className="tourism-list-panel">
      <div className="tourism-list-panel__head">
        <div>
          <h2>추천 한옥마을</h2>
          <span className="tourism-list-panel__count">{villages.length}개 결과</span>
        </div>
        <SortDropdown sortBy={sortBy} onChange={onSortChange} />
      </div>

      <ul className="tourism-list-panel__list">
        {villages.map((village) => (
          <TourismListItem
            key={village.id}
            village={village}
            isActive={village.id === activeId}
            onSelect={() => onSelect(village.id)}
          />
        ))}
        {villages.length === 0 && (
          <li className="tourism-list-panel__empty">조건에 맞는 한옥마을이 없습니다.</li>
        )}
      </ul>

      <div className="tourism-list-panel__footer">
        <button type="button" className="tourism-list-panel__footer-btn tourism-list-panel__footer-btn--outline">
          내 주변 기반 설정
        </button>
        <button type="button" className="tourism-list-panel__footer-btn tourism-list-panel__footer-btn--solid">
          필터 적용
        </button>
      </div>
    </aside>
  );
}

export default TourismListPanel;
