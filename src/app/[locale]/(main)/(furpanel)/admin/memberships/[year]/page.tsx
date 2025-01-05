"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MembershipView({params}: {params: Promise<{ year: number }>}) {

    const [selectedYear, setSelectedYear] = useState<number>();
    const router = useRouter();
    
    // Select year
    useEffect(()=>{
        params.then((loadedParams)=>{
            // Validate year
            if (!loadedParams.year || isNaN(loadedParams.year)) {
                router.replace(""+new Date().getFullYear());
            }
            setSelectedYear(loadedParams.year)
        })
    }, []);

    return <>
        <div className="page">
            {selectedYear}
        </div>
    </>;
}