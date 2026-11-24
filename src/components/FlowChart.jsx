import { useEffect, useRef, useState } from 'react';
import data from '../data.js';
import Charts from '../lib/charts.js';
import { fmtDay, int } from '../lib/format.js';

export default function FlowChart({ size }) {
  const chartRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (failed) return undefined;
    const element = chartRef.current;
    if (!element) return undefined;

    const weeks = data.weeks.slice(-size);
    const draw = () => {
      try {
        Charts.diverging(element, {
          labels: weeks.map((week) => fmtDay(week.start)),
          up: weeks.map((week) => week.joined),
          down: weeks.map((week) => week.cancelled),
          above: 'Katılan',
          below: 'Ayrılan',
          height: 240,
          xAt: element.clientWidth < 520
            ? (size === 4 ? [1, 2, 3] : size === 8 ? [2, 5, 7] : [3, 7, 10, 12])
            : null,
          format: (value) => int.format(value),
          tickFormat: (value) => int.format(value)
        });
      } catch (error) {
        console.error('Abone akışı çizilemedi:', error);
        setFailed(true);
      }
    };

    draw();
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 160);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, [size, failed, attempt]);

  if (failed) {
    return (
      <div className="empty-state">
        <strong>Grafik yüklenemedi.</strong>
        <span>Veri dosyası okunamadı.</span>
        <button
          className="row-action"
          type="button"
          onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}
        >
          Yeniden dene
        </button>
      </div>
    );
  }

  return <div className="chart" key={size} ref={chartRef} />;
}
