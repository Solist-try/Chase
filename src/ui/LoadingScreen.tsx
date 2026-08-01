import './ui.css';

interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <div className="loading-screen">
      <div className="loading-screen__card">
        <p className="loading-screen__kicker">Getting ready</p>
        <h1 className="loading-screen__title">Dragon Adventure!</h1>
        <p className="loading-screen__copy">Packing stars, gems, and cheerful tunes…</p>
        <div
          className="loading-screen__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Loading game assets"
        >
          <span className="loading-screen__fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="loading-screen__pct">{pct}%</p>
      </div>
    </div>
  );
}
