import Image from "next/image";
import Icon from "@/components/icon";
import LogoDark from "../../public/images/logo_dark.svg";
import LogoLight from "../../public/images/logo_light.svg";

export default function NotFound() {
    return (
        <div className={"main-dialog rounded-m pad"} style={{ marginTop: "10mm" }}>
            <picture className="footer-logo">
                <source srcSet={LogoDark.src} media="(prefers-color-scheme: dark)" />
                <Image className="footer-logo"
                    src={LogoLight.src}
                    alt="Furizon logo"
                    width={256}
                    height={60} />
            </picture>
            <div className="horizontal-list align-items-center gap-2mm">
                <Icon className="xx-large" icon="FIND_IN_PAGE" />
                <p>
                    <span className="title bold medium">
                        Not found
                    </span>
                    <br></br>
                    <span className="descriptive">The requested resouce cannot be found</span>
                </p>
            </div>
        </div>
    );
}