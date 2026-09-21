import "./CongestionBar.css";

/**
 * 한국관광공사 집중률 예측. rate는 0~100 지수로, 값 자체가 곧 막대 길이다
 * (2018년 이후 최고치를 100으로 정규화한 값).
 */
function CongestionBar({ congestion, showLabel = true }) {
  const { level, label, rate } = congestion;
  const percent = Math.min(100, rate);

  return (
    <div className="congestion-bar">
      {showLabel && (
        <span className="congestion-bar__caption">오늘 집중률 {Math.round(rate)}</span>
      )}
      <div className="congestion-bar__track">
        <div
          className={`congestion-bar__fill congestion-bar__fill--${level}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`congestion-bar__level congestion-bar__level--${level}`}>{label}</span>
    </div>
  );
}

export default CongestionBar;
