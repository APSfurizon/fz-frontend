import Image from "next/image";
import Icon from "@/components/icon";

export default function NotFound() {
    return (
        <html lang="en">
            <body>
                <div className={"main-dialog rounded-m pad"} style={{ marginTop: "10mm" }}>
                    <Image className="footer-logo"
                        src="/images/logo-dark.png"
                        alt="Furizon logo"
                        width={256}
                        height={60}/>
                    <div className="horizontal-list flex-vertical-center gap-2mm">
                        <Icon className="xx-large" icon={"FIND_IN_PAGE"}/>
                        <p>
                            <span className="title bold medium">
                                Not found
                            </span>
                            <br></br>
                            <span className="descriptive">The requested resouce cannot be found</span>
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}