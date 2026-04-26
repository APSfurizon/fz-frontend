'use client'
import useTitle from "@/components/hooks/useTitle";
import { useTranslations } from "next-intl";
import { useUser } from "@/components/context/userProvider";
import { hasPermission, Permissions } from "@/lib/api/permission";
import ErrorMessage from "@/components/errorMessage";
import Link from "next/link";

export default function SecurityPage() {
    const t = useTranslations();
    const { userDisplay } = useUser();

    useTitle(t('furpanel.security.title'));

    if (!hasPermission(Permissions.CAN_SEE_ADMIN_PAGES, userDisplay)) {
        return <ErrorMessage title={t('common.error')} message={t('common.unauthorized')} />;
    }

    return (
        <div className="security-page">
            <div className="page-content">
                <span className="title medium">{t('furpanel.security.title')}</span>

            </div>
        </div>
    );
}
