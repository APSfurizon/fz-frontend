'use client'
import useTitle from "@/components/hooks/useTitle";
import Button from "@/components/input/button";
import { useRouter } from "next/navigation";

export default function SecurityDocumentsPage() {
    useTitle("Documents");
    const router = useRouter();

    return (
        <div className="stretch-page compact-main">
            <div style={{ marginBottom: 8 }}>
                <Button icon="ARROW_BACK" onClick={() => router.push("/admin")}>Indietro</Button>
            </div>
            {/* TODO: Documents */}
        </div>
    );
}
