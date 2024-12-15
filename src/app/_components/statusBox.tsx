import { CSSProperties } from "react";
import "../styles/components/statusBox.css";

export default function statusBox ({children, status="normal", style, className}: Readonly<{
    children?: React.ReactNode,
    status?: "warning" | "success" | "normal" | "error",
    style?: CSSProperties,
    className?: string,
  }>) {

    return (
        <div className={`rounded-s statusBox ${className ?? ""} ${status ?? ""}`}
            style={{...style}}>
            <span className="title" style={{fontSize: '15px'}}>{children}</span>
        </div>
    );
}