import Icon, { MaterialIcon } from "@/components/icon";

export default function OrderItem({
    icon,
    title,
    description,
    className
}: Readonly<{
    icon: MaterialIcon,
    title: string | React.ReactNode,
    description?: string | React.ReactNode,
    className?: string
}>) {
    return <div className={`item vertical-list flex-vertical-center ${className ?? ""}`}>
        <Icon className="x-large" icon={icon}/>
        <span className="descriptive small item-name">{title}</span>
        {description && <span className="descriptive tiny item-subtitle">{description}</span>}
    </div>
}