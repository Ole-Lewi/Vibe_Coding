export default function MyBets({ bets }) {
  if (!bets.length) return <p className="muted">No bets yet. Place your first one.</p>;
  return (
    <>
      {bets.map((b) => (
        <div className="card" key={b.id}>
          <div className="bet-head">
            <strong>
              {b.legs.length > 1 ? `Accumulator (${b.legs.length})` : "Single"}
            </strong>
            <span className={`status ${b.status.toLowerCase()}`}>{b.status}</span>
          </div>
          {b.legs.map((l, i) => (
            <div className="leg" key={i}>
              <div>
                <div>{l.event_name}</div>
                <small className="muted">{l.pick} @ {Number(l.odds).toFixed(2)}</small>
              </div>
              <span className={`dot ${l.status.toLowerCase()}`} />
            </div>
          ))}
          <small className="muted">
            Stake {b.stake} · odds {Number(b.odds).toFixed(2)} · returns {b.potential_return}
          </small>
        </div>
      ))}
    </>
  );
}