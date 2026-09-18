import { regionFilters } from "../../data/mapFilters.js";
import "./RegionSearchBar.css";

function RegionSearchBar({ keyword, onKeywordChange, region, onRegionChange }) {
  return (
    <div className="region-search-bar">
      <div className="region-search-bar__input">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="한옥마을, 지역, 체험을 검색해보세요"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          aria-label="한옥마을 검색"
        />
      </div>

      <div className="region-search-bar__chips" role="group" aria-label="지역 필터">
        {regionFilters.map((r) => (
          <button
            key={r.id}
            type="button"
            className={region === r.id ? "region-chip is-active" : "region-chip"}
            onClick={() => onRegionChange(region === r.id ? null : r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <button type="button" className="region-search-bar__settings" aria-label="상세 필터 설정">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7h10M18 7h2M4 17h2M8 17h12M11 4v6M15 14v6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default RegionSearchBar;
