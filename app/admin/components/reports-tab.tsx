"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { getReportedItems, moderateItem } from "@/lib/api/admin";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";
import { ActivitySkeleton } from "./skeletons";
import { fetchData } from "@/lib/utils/swrHelper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ReportsTab() {
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const { data: reportedItems, isLoading, mutate } = useSWR(['reported-items', 50], () => fetchData(() => getReportedItems(50)));

    const toggleExpanded = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleModerateItem = async (itemId: string, action: "hide" | "restore") => {
        const result = await moderateItem(itemId, { action });

        if (result.ok) {
            toast.success(`Item ${action === "hide" ? "hidden" : "restored"} successfully`);
            mutate();
        } else {
            toast.error(`Failed to ${action} item`);
        }
    };

    if (isLoading) {
        return <ActivitySkeleton />;
    }

    return (
        <Card>
            <CardHeader className="px-6 py-6">
                <CardTitle>Reported Items</CardTitle>
                <CardDescription>Review and moderate reported content</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                    {(!reportedItems || reportedItems.length === 0) ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Flag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No reported items</p>
                        </div>
                    ) : (
                        reportedItems.map((item) => {
                            const isExpanded = expandedItems.has(item.item_id);

                            return (
                                <div
                                    key={item.item_id}
                                    className="rounded-lg border bg-card"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 mt-1">
                                                <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <button
                                                            onClick={() => router.push(`/items/${item.item_id}`)}
                                                            className="font-semibold text-base hover:underline flex items-center gap-2 group"
                                                        >
                                                            <span className="truncate">{item.item_title}</span>
                                                            <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-muted-foreground">
                                                                by {item.item_owner_name}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Badge variant="destructive" className="gap-1">
                                                            <Flag className="h-3 w-3" />
                                                            {item.report_count} {item.report_count === 1 ? 'report' : 'reports'}
                                                        </Badge>
                                                        {item.is_hidden && (
                                                            <Badge variant="secondary" className="gap-1">
                                                                <EyeOff className="h-3 w-3" />
                                                                Hidden
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {item.is_hidden && item.hidden_reason && (
                                                    <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm mb-3">
                                                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <span className="font-medium">Hidden: </span>
                                                            <span className="text-muted-foreground">
                                                                {item.hidden_reason.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mt-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleExpanded(item.item_id)}
                                                        className="gap-2"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="h-4 w-4" />
                                                                Hide Reports
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-4 w-4" />
                                                                View Reports
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/items/${item.item_id}`)}
                                                        className="gap-2"
                                                    >
                                                        View Item
                                                    </Button>

                                                    {item.is_hidden ? (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleModerateItem(item.item_id, "restore")}
                                                            className="gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Restore
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleModerateItem(item.item_id, "hide")}
                                                            className="gap-2"
                                                        >
                                                            <EyeOff className="h-4 w-4" />
                                                            Hide Item
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t px-5 py-4 bg-muted/20">
                                            <h4 className="font-semibold text-sm mb-3">Reports ({item.reports.length})</h4>
                                            <div className="space-y-3">
                                                {item.reports.map((report) => (
                                                    <div
                                                        key={report.id}
                                                        className="flex items-start gap-3 p-3 rounded-md bg-card border"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {report.reporter_name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                <span className="font-medium text-foreground">Reason:</span> {report.reason}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={report.status === "pending" ? "secondary" : "outline"}
                                                            className="shrink-0 capitalize"
                                                        >
                                                            {report.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
