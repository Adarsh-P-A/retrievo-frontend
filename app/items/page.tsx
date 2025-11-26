import { fetchFoundItems, fetchLostItems } from '@/lib/api';
import { ItemsBrowse } from './items-browse';


export default async function BrowseItemsPage() {
    let lostItems = [];
    let foundItems = [];

    try {
        [lostItems, foundItems] = await Promise.all([
            fetchLostItems(),
            fetchFoundItems()
        ]);
    } catch (error) {
        console.error("Failed to fetch items from API:", error);
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
                        <p className="text-muted-foreground mt-1">
                            Search through lost and found items in your area.
                        </p>
                    </div>
                </div>
            </div>

            <ItemsBrowse initialLostItems={lostItems} initialFoundItems={foundItems} />
        </div>
    );
}