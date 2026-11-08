import { useState } from "react";
import { api } from "./api";

const KEY = { HOME: "home_odds", DRAW: "draw_odds", AWAY: "away_odds" };

export default function BetSlip({ slip, onClear, onPlaced }) {
  const [stake, setStake] = useState("100");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!slip) {
    return (
      <div className="card">
        <h3>Bet slip</h3>
        <p className="muted">Tap an odd to add a selection.</p>
      </div>
    );
  }

  const odds = Number(slip.event[KEY[slip.pick]]);
  const payout = (Number(stake || 0) * odds).toFixed(2);
  const label = slip.pick === "DRAW" ? "Draw"
    : slip.pick === "HOME" ? slip.event.home_team : slip.event.away_team;

  async function place() {
    setError("");
    setLoading(true);
    try {
      await api("/bets/place/", {
        method: "POST",
        body: { event_id: slip.event.id, pick: slip.pick, stake },
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
      <h3>Bet slip</h3>
      <div className="teams">{slip.event.home_team} vs {slip.event.away_team}</div>
      <p>Pick: <strong>{label}</strong> @ {odds.toFixed(2)}</p>
      <label className="muted">Stake</label>
      <input type="number" min="1" value={stake} onChange={(e) => setStake(e.target.value)} />
      <p>Potential return: <strong>{payout}</strong></p>
      {error && <p className="error">{error}</p>}
      <button className="primary" onClick={place} disabled={loading || !stake}>
        {loading ? "Placing..." : "Place bet"}
      </button>
      <button className="link" onClick={onClear}>Clear</button>
    </div>
  );
}