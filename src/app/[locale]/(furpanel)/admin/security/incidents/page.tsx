'use client'
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";

export default function SecurityIncidentsPage() {
    const t = useTranslations();
    useTitle("Registro Incidenti");

    return (
        <div className="stretch-page">
            {/* TODO: Registro Incidenti */}
        </div>
    );
}
