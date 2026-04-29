'use client'
import { useTranslations } from "next-intl";
import useTitle from "@/components/hooks/useTitle";

export default function SecurityDocumentsPage() {
    const t = useTranslations();
    useTitle("Documents");

    return (
        <div className="stretch-page">
            {/* TODO: Documents */}
        </div>
    );
}
