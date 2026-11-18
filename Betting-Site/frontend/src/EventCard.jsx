export default function EventCard( { event, slip = [], onPick }) {
    const picks = [
        ["HOME", event.home_odds, event.home_team],
        ["DRAW", event.draw_odds, "Draw"],
        ["AWAY", event.away_odds, event.away_team],
    ];
    const when = new Date(event.starts_at).toLocaleString([], {
        weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });

    return (
        <div className="card event">
            <div ClassName="meta">{event.sport} . {when}</div>
            <div ClassName="teams">{event.home_team} <span>vs</span> {event.away.team}</div>
            <div className="odds">
                {picks.map(([picks, odds, label]) => {
                    const selected = slip.some((s) => s.event.id ===event.id && s.pick === pick);
                    return (
                        <button
                        key={pick}
                        className={selected ? "odd selected" : "odd"}
                        onClick={() => onPick(event, pick)}
                        >
                            <small>{label}</small>
                            <strong>{Number(odds).toFixed(2)}</strong>

                        </button>
                    );
                })}
            </div>
        </div>
    );
}