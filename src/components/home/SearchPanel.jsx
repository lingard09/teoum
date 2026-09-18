import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchPanel.css";

const DESTINATION_OPTIONS = [
  "전국 전체 한옥마을",
  "서울/경기",
  "영남권",
  "호남권",
  "강원/충청",
];

const THEME_OPTIONS = [
  "전통 고택 & 다도",
  "체험 & 공방",
  "역사 탐방",
  "자연 & 힐링",
  "맛집 탐방",
];

function FieldDropdown({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="search-field" ref={ref}>
      <span className="search-field__label">{label}</span>
      <button
        type="button"
        className="search-field__value"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
      </button>
      {open && (
        <ul className="search-field__dropdown" role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={opt === value ? "is-selected" : ""}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                role="option"
                aria-selected={opt === value}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchPanel() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(DESTINATION_OPTIONS[0]);
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [date, setDate] = useState("");
  const dateInputRef = useRef(null);

  const dateLabel = date
    ? new Date(date).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })
    : "날짜 선택";

  function handleSubmit() {
    const params = new URLSearchParams();
    if (destination !== DESTINATION_OPTIONS[0]) params.set("region", destination);
    if (theme) params.set("theme", theme);
    if (date) params.set("date", date);
    navigate(`/map?${params.toString()}`);
  }

  return (
    <div className="search-panel">
      <FieldDropdown
        label="여행지"
        value={destination}
        options={DESTINATION_OPTIONS}
        onSelect={setDestination}
      />
      <div className="search-panel__divider" aria-hidden="true" />

      <div className="search-field">
        <span className="search-field__label">일정</span>
        <button
          type="button"
          className="search-field__value"
          onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.focus()}
        >
          {dateLabel}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="search-field__date-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="여행 날짜 선택"
        />
      </div>
      <div className="search-panel__divider" aria-hidden="true" />

      <FieldDropdown
        label="여행 테마"
        value={theme}
        options={THEME_OPTIONS}
        onSelect={setTheme}
      />

      <button type="button" className="search-panel__submit" onClick={handleSubmit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        맞춤 여정 찾기
      </button>
    </div>
  );
}

export default SearchPanel;
