import { Suspense } from "react";
import ItemPageContent from "./page_content";
import Loading from "./loading";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense fallback={<Loading />}>
            <ItemPageContent id={id} />
        </Suspense>
    );
}
