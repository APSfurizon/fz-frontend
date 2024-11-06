import { CSSProperties } from "react";
import "../styles/components/statusBox.css";

export default function statusBox ({children, status, style, className}: Readonly<{
    children?: React.ReactNode,
    status?: string,
    style?: CSSProperties,
    className?: string,
  }>) {

    return (
        <div
            className={"statusBox" + " " + (className ?? "") + " " + (status)}
            style={{...style}}>
            <span className="title normal" style={{fontSize: '15px'}}>{children}</span>
        </div>
    );
}