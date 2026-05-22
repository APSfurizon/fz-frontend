export default function ScheduleLegend() {
    const items = [
        { label: "PANEL", className: "tipologia-panel" },
        { label: "EVENT", className: "tipologia-event" },
        { label: "GAME", className: "tipologia-game" },
        { label: "TOURNAMENT", className: "tipologia-tournament" },
        { label: "DEALERS", className: "tipologia-dealers" },
        { label: "EXPLORERS", className: "tipologia-explorers" },
        { label: "SUPERSPONSORS", className: "tipologia-supersponsors" },
        { label: "OTHER", className: "tipologia-other" },
    ];

    return (
        <div className="schedule-legend">
            {items.map((item) => (
                <div key={item.label} className="schedule-legend-item">
                    <span className={`schedule-legend-color ${item.className}`} />
                    <span className="schedule-legend-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
}