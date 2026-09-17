import "./CongestionBar.css";

function CongestionBar({ congestion, showLabel = true }) {
  const { level, label, score } = congestion;
  const percent = Math.min(100, (score / 5) * 100);

  return (
    <div className="congestion-bar">
      {showLabel && <span className="congestion-bar__caption">혼잡도 (예측지수 {score.toFixed(1)})</span>}
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
