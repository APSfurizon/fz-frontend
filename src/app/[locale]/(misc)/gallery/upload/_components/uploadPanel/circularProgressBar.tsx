type CircularProgressBarProps = {
    max: number,
    value: number,
    size: number,
    width: number
}

export default function CircularProgressBar(props: Readonly<CircularProgressBarProps>) {
    const radius = (props.size - props.width) / 2;
    const progress = Math.max(0, Math.min(100, Math.round(100 * props.value / props.max)));
    const circumference = Math.PI * radius * 2;
    const offset = circumference * ((100 - progress) / 100);

    return <svg className="circular-progress-bar"
        viewBox={`0 0 ${props.size} ${props.size}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <circle r={radius}
            cx={props.size / 2}
            cy={props.size / 2}
            fill="transparent"
            stroke="#e0e0e0"
            strokeWidth={props.width} />
        <circle r={radius}
            cx={props.size / 2}
            cy={props.size / 2}
            stroke="#76e5b1"
            strokeWidth={props.width}
            strokeLinecap="round"
            strokeDashoffset={offset}
            fill="transparent"
            strokeDasharray={circumference} />
    </svg>
}