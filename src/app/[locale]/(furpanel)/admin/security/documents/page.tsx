'use client'
import useTitle from "@/components/hooks/useTitle";
import FpButton from "@/components/input/fpButton";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function SecurityDocumentsPage() {
    const t = useTranslations();
    const locale = useLocale();
    useTitle(t("furpanel.admin.security_management.title_documents"));
    const router = useRouter();

    return (
        <div className="stretch-page compact-main">
            <div style={{ marginBottom: 8 }}>
                <FpButton icon="ARROW_BACK" onClick={() => router.push(`/${locale}/admin`)}>Indietro</FpButton>
            </div>
            {/* TODO: Documents */}
        </div>
    );
}
