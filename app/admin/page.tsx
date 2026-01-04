"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Package,
    Flag,
    Eye,
    EyeOff,
    Trash2,
    AlertCircle,
    Ban,
} from "lucide-react";
import { getActivity, getClaims, getReportedItems, getStats, getUsers, moderateItem, moderateUser } from "@/lib/api/admin";
import { notFound, useRouter } from "next/navigation";

// Helper for SWR
async function fetchData<T>(fn: () => Promise<{ ok: boolean, data?: T, error?: string }>) {
    const res = await fn();
    if (!res.ok) throw new Error(res.error || "Failed to fetch data");
    return res.data as T;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function AdminDashboard() {
    const [selectedTab, setSelectedTab] = useState("overview");
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        action: () => Promise<void>;
        title: string;
        description: string;
    }>({ open: false, action: async () => { }, title: "", description: "" });
    const router = useRouter();

    const { error: adminError, isLoading: adminLoading } = useSWR(
        "admin-check",
        () => fetchData(() => getStats()) // cheap admin-only call
    );

    const { data: stats, mutate: mutateStats } = useSWR('stats', () => fetchData(() => getStats()));

    const { data: activity } = useSWR(
        selectedTab === 'overview' ? ['activity', 10] :
            selectedTab === 'activity' ? ['activity', 50] : null,
        ([, limit]) => fetchData(() => getActivity(limit))
    );

    const { data: claims } = useSWR(
        selectedTab === 'claims' ? ['claims', undefined, 50, 0] : null,
        ([, status, limit, skip]) => fetchData(() => getClaims(status, limit, skip))
    );

    const { data: users, mutate: mutateUsers } = useSWR(
        selectedTab === 'users' ? ['users', 50, 0] : null,
        ([, limit, skip]) => fetchData(() => getUsers(limit, skip))
    );

    const { data: reportedItems, mutate: mutateItems } = useSWR(
        selectedTab === 'items' ? ['items', 50, 0] : null,
        ([, limit, skip]) => fetchData(() => getReportedItems(limit, skip))
    );

    const handleModerateUser = async (
        userId: number,
        action: "warn" | "temp_ban" | "perm_ban" | "unban",
        reason?: string
    ) => {
        try {
            await moderateUser(userId, { action, reason, ban_days: 7 });
            mutateUsers();
            mutateStats();
        } catch (error) {
            console.error("Failed to moderate user:", error);
        }
    };

    const handleModerateItem = async (
        itemId: string,
        action: "hide" | "restore" | "delete",
        reason?: string
    ) => {
        try {
            await moderateItem(itemId, { action, reason });
            mutateItems();
            mutateStats();
        } catch (error) {
            console.error("Failed to moderate item:", error);
        }
    };

    const confirmAction = (action: () => Promise<void>, title: string, description: string) => {
        setActionDialog({ open: true, action, title, description });
    };

    const getTrendIndicator = (current: number, previous: number) => {
        if (current > previous) {
            return (
                <span className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    {previous > 0 ? `+${Math.round(((current - previous) / previous) * 100)}%` : "New"}
                </span>
            );
        } else if (current < previous) {
            return (
                <span className="flex items-center gap-1 text-sm text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    {previous > 0 ? `-${Math.round(((previous - current) / previous) * 100)}%` : ""}
                </span>
            );
        }
        return <span className="text-sm text-muted-foreground">No change</span>;
    };

    // Still checking admin access
    if (adminLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Skeleton className="h-8 w-48" />
            </div>
        );
    }

    if (adminError) {
        return notFound();
    }

    return (
        <div className="container mx-auto py-10 px-6 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Platform management and moderation control center
                </p>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="claims">Claims</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Items
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 pb-5">
                                <div className="text-2xl font-bold">{stats?.total_items || 0}</div>
                                <div className="mt-1">
                                    {getTrendIndicator(
                                        stats?.items_this_month || 0,
                                        stats?.items_last_month || 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.items_this_month || 0} posted this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending Claims
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 pb-5">
                                <div className="text-2xl font-bold">{stats?.claims_pending || 0}</div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    {stats?.claims_approved_this_month || 0} approved,{" "}
                                    {stats?.claims_rejected_this_month || 0} rejected this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Reports
                                </CardTitle>
                                <Flag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 pb-5">
                                <div className="pb-2">
                                    <div className="text-2xl font-bold">{stats?.active_reports || 0}</div>
                                    <div className="mt-1">
                                        {getTrendIndicator(
                                            stats?.reports_this_month || 0,
                                            stats?.reports_last_month || 0
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stats?.reports_this_month || 0} reports this month
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 pb-5">
                                <div className="text-2xl font-bold p-2">{stats?.total_users || 0}</div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    {stats?.users_this_month || 0} joined this month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity Preview */}
                    <Card>
                        <CardHeader className="px-6 py-6">
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest platform actions and events</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-3">
                                {!activity ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <Skeleton className="h-5 w-5 rounded-full mt-1" />
                                            <div className="flex-1 space-y-1">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    ))
                                ) : (activity || []).length === 0 ? (
                                    <div className="text-center text-muted-foreground py-4">
                                        No recent activity
                                    </div>
                                ) : (
                                    (activity || []).slice(0, 8).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 py-4 border-b last:border-0 last:pb-0"
                                        >
                                            <div className="mt-1">
                                                {item.type === "claim_approved" && (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                )}
                                                {item.type === "claim_rejected" && (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                {item.type === "claim_pending" && (
                                                    <Clock className="h-5 w-5 text-yellow-600" />
                                                )}
                                                {item.type === "report_filed" && (
                                                    <Flag className="h-5 w-5 text-orange-600" />
                                                )}
                                                {item.type === "item_auto_hidden" && (
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">{item.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Claims Tab */}
                <TabsContent value="claims" className="space-y-4">
                    <Card>
                        <CardHeader className="px-6 py-6">
                            <CardTitle>Claims Moderation</CardTitle>
                            <CardDescription>Review and moderate item claims</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-4">Item</TableHead>
                                        <TableHead className="px-4 py-4">Claimer</TableHead>
                                        <TableHead className="px-4 py-4">Owner</TableHead>
                                        <TableHead className="px-4 py-4">Status</TableHead>
                                        <TableHead className="px-4 py-4">Submitted</TableHead>
                                        <TableHead className="px-4 py-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!claims ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-4 w-24" />
                                                        <Skeleton className="h-3 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (claims || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No claims to review
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (claims || []).map((claim) => (
                                            <TableRow key={claim.id}>
                                                <TableCell className="font-medium max-w-xs truncate px-4 py-5">
                                                    {claim.item_title}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <div>
                                                        <div className="font-medium">{claim.claimer_name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {claim.claimer_email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">{claim.item_owner_name}</TableCell>
                                                <TableCell className="px-4 py-5">
                                                    {claim.status === "pending" && (
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                    {claim.status === "approved" && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Approved
                                                        </Badge>
                                                    )}
                                                    {claim.status === "rejected" && (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Rejected
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground px-4 py-5">
                                                    {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a href={`/claims/${claim.id}`}>View</a>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader className="px-6 py-6">
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Monitor and moderate platform users</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-4">User</TableHead>
                                        <TableHead className="px-4 py-4">Email</TableHead>
                                        <TableHead className="px-4 py-4">Items Posted</TableHead>
                                        <TableHead className="px-4 py-4">Reports</TableHead>
                                        <TableHead className="px-4 py-4">Warnings</TableHead>
                                        <TableHead className="px-4 py-4">Status</TableHead>
                                        <TableHead className="px-4 py-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!users ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <Skeleton className="h-4 w-24" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (users || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (users || []).map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="px-4 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.image} alt={user.name} />
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="font-medium">{user.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground px-4 py-5">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">{user.items_posted}</TableCell>
                                                <TableCell className="px-4 py-5">
                                                    {user.reports_received > 0 ? (
                                                        <span className="font-medium text-red-600">
                                                            {user.reports_received}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    {user.warning_count > 0 ? (
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                                            {user.warning_count}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    {user.is_banned ? (
                                                        <Badge variant="destructive">
                                                            <Ban className="h-3 w-3 mr-1" />
                                                            Banned
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <div className="flex gap-2">
                                                        {!user.is_banned ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        confirmAction(
                                                                            () => handleModerateUser(user.id, "warn"),
                                                                            "Warn User",
                                                                            `Add a warning to ${user.name}'s account?`
                                                                        )
                                                                    }
                                                                >
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    Warn
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600"
                                                                    onClick={() =>
                                                                        confirmAction(
                                                                            () =>
                                                                                handleModerateUser(
                                                                                    user.id,
                                                                                    "temp_ban",
                                                                                    "Temporary ban - admin action"
                                                                                ),
                                                                            "Temporary Ban",
                                                                            `Temporarily ban ${user.name} for 7 days?`
                                                                        )
                                                                    }
                                                                >
                                                                    <Ban className="h-3 w-3 mr-1" />
                                                                    Ban
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    confirmAction(
                                                                        () => handleModerateUser(user.id, "unban"),
                                                                        "Unban User",
                                                                        `Remove ban from ${user.name}?`
                                                                    )
                                                                }
                                                            >
                                                                Unban
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-4">
                    <Card>
                        <CardHeader className="px-6 py-6">
                            <CardTitle>Reported Items</CardTitle>
                            <CardDescription>Review and moderate flagged content</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-4">Item</TableHead>
                                        <TableHead className="px-4 py-4">Type</TableHead>
                                        <TableHead className="px-4 py-4">Owner</TableHead>
                                        <TableHead className="px-4 py-4">Reports</TableHead>
                                        <TableHead className="px-4 py-4">Status</TableHead>
                                        <TableHead className="px-4 py-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!reportedItems ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-48" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (reportedItems || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No reported items
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (reportedItems || []).map((item) => (
                                            <TableRow key={item.item_id}>
                                                <TableCell className="font-medium max-w-xs px-4 py-5">
                                                    <div>{item.item_title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {item.reports.slice(0, 2).map((r) => r.reason).join(", ")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <Badge variant="outline">
                                                        {item.item_type === "lost" ? "Lost" : "Found"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">{item.item_owner_name}</TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <Badge variant="destructive">{item.report_count}</Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    {item.is_hidden ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700">
                                                            <EyeOff className="h-3 w-3 mr-1" />
                                                            Hidden
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Visible
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.push(`/items/${item.item_id}`)
                                                            }
                                                        >
                                                            View Item
                                                        </Button>
                                                        {!item.is_hidden ? (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    confirmAction(
                                                                        () =>
                                                                            handleModerateItem(
                                                                                item.item_id,
                                                                                "hide",
                                                                                "Hidden by admin - multiple reports"
                                                                            ),
                                                                        "Hide Item",
                                                                        `Hide "${item.item_title}" from public view?`
                                                                    )
                                                                }
                                                            >
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Hide
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    confirmAction(
                                                                        () => handleModerateItem(item.item_id, "restore"),
                                                                        "Restore Item",
                                                                        `Restore "${item.item_title}" to public view?`
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Restore
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                confirmAction(
                                                                    () => handleModerateItem(item.item_id, "delete"),
                                                                    "Delete Item",
                                                                    `Permanently delete "${item.item_title}"? This action cannot be undone.`
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader className="px-6 py-6">
                            <CardTitle>Activity Feed</CardTitle>
                            <CardDescription>Comprehensive platform activity log</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-5">
                                {(activity || []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-4 p-5 rounded-lg border bg-card"
                                    >
                                        <div className="mt-1">
                                            {item.type === "claim_approved" && (
                                                <div className="p-2 rounded-full bg-green-100">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                </div>
                                            )}
                                            {item.type === "claim_rejected" && (
                                                <div className="p-2 rounded-full bg-red-100">
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                </div>
                                            )}
                                            {item.type === "claim_pending" && (
                                                <div className="p-2 rounded-full bg-yellow-100">
                                                    <Clock className="h-5 w-5 text-yellow-600" />
                                                </div>
                                            )}
                                            {item.type === "report_filed" && (
                                                <div className="p-2 rounded-full bg-orange-100">
                                                    <Flag className="h-5 w-5 text-orange-600" />
                                                </div>
                                            )}
                                            {item.type === "item_auto_hidden" && (
                                                <div className="p-2 rounded-full bg-red-100">
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {item.type.replace("_", " ")}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Confirmation Dialog */}
            <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{actionDialog.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await actionDialog.action();
                                setActionDialog({ ...actionDialog, open: false });
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
