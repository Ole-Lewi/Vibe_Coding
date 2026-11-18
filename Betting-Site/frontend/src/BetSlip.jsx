import { useState } from "react";
import { api } from "./api";

const KEY = { HOME: "home_odds", DRAW: "draw_odds", AWAY: "away_odds" };

const label = (s) =>
  s.pick === "DRAW" ? "Draw" : s.pick === "HOME" ? s.event.home_team : s.event.away_team;

export default function BetSlip({ slip, onRemove, onClear, onPlaced }) {
  const [stake, setStake] = useState("100");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!slip.length) {
    return (
      <div className="card">
        <h3>Bet slip</h3>
        <p className="muted">Tap odds on one or more matches to build your bet.</p>
      </div>
    );
  }

  const combined = Number(
    slip.reduce((acc, s) => acc * Number(s.event[KEY[s.pick]]), 1).toFixed(2)
  );
  const payout = (Number(stake || 0) * combined).toFixed(2);

  async function place() {
    setError("");
    setLoading(true);
    try {
      await api("/bets/place/", {
        method: "POST",
        body: {
          selections: slip.map((s) => ({ event_id: s.event.id, pick: s.pick })),
          stake,
        },
      });
      onPlaced();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>{slip.length > 1 ? `Accumulator (${slip.length})` : "Bet slip"}</h3>
      {slip.map((s) => (
        <div className="sel" key={s.event.id}>
          <div>
            <div className="teams">{s.event.home_team} vs {s.event.away_team}</div>
            <small className="muted">
              {label(s)} @ {Number(s.event[KEY[s.pick]]).toFixed(2)}
            </small>
          </div>
          <button className="x" onClick={() => onRemove(s.event.id)}>×</button>
        </div>
      ))}
      <p>Total odds: <strong>{combined.toFixed(2)}</strong></p>
      <label className="muted">Stake</label>
      <input type="number" min="1" value={stake} onChange={(e) => setStake(e.target.value)} />
      <p>Potential return: <strong>{payout}</strong></p>
      {error && <p className="error">{error}</p>}
      <button className="primary" onClick={place} disabled={loading || !stake}>
        {loading ? "Placing..." : "Place bet"}
      </button>
      <button className="link" onClick={onClear}>Clear all</button>
    </div>
  );
}