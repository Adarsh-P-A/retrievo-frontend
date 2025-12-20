import { Suspense } from "react";
import Loading from "../loading";
import { notFound } from "next/navigation";
import { fetchItem, fetchItemClaimStatus } from "@/lib/api/server";
import { auth } from "@/auth";
import ItemEditable from "./item-editable-client";
import { stat } from "fs";

export default async function ItemPage({ params }: { params: Promise<{ id: string; }>; }) {
    const session = await auth();

    const { id } = await params;

    // Fetch item data
    const item_reporter_details = await fetchItem(id, session?.backendToken);
    if (!item_reporter_details.ok) notFound();

    const item_claim_status = await fetchItemClaimStatus(id, session?.backendToken);

    const { item, reporter } = item_reporter_details.data;
    const { status } = item_claim_status.data;

    return (
        <Suspense fallback={<Loading />}>
            <ItemEditable item={item} reporter={reporter} status={status} session={session} />
        </Suspense>
    );
}

