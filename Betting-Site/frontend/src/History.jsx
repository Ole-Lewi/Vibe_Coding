export default function History({txs}) {
    if (!txs.length) return <p className="muted">No transaction yet.</p>;
    return(
        <div className="card">
            {txs.map((t) => {
                const amt = Number(t.amount);
                return (
                    <div className="bet-row" key={t.id}>
                        <div>
                            <div>{t.kind.charAt(0) + t.kind.slice(1).toLowerCase()}</div>
                            <small className="muted">
                                {t.note || "-"} . {new Date(t.created_at).toLocaleString()}
                            </small>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className={amt > 0 ? "amt pos" : "amt neg"}>
                                {amt >= 0 ? "+" : ""}{amt.toFixed(2)}
                            </div>
                            <small className="muted">bal {Number(t.balance_after).toFixed(2)}</small>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}