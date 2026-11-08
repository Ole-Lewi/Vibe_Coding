export default function MyBets({ bets }) {
    if (!bets.length) return <p className="muted">No bets yet. Place your first bet!</p>
    return (
        <div classname="card">
            {bets.map((b) => (
                <div className="bet-row" key={b.id}>
                    <div>
                        <div>{b.event_name}</div>
                        <small className="muted">{b.pick} @ {Number(b.odds).toFixed(2)} . stake {b.stake}</small>
                    </div>
                    <span className={`status ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
            ))}
        </div>
    );
}