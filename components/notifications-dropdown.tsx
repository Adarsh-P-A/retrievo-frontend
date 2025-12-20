"use client"

import { useState } from "react"
import { Bell, Check, Info, AlertTriangle, Ban, X, CheckCheck, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Notification, NotificationType } from "@/types/notification"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

// Mock data generator
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "claim_approved",
        title: "Claim Approved",
        message: "Your claim for 'Blue Umbrella' has been approved. You can pick it up at the Student Center.",
        item_id: "item-123",
        is_read: false,
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        type: "system_notice",
        title: "Maintenance Scheduled",
        message: "The platform will be down for maintenance on Saturday from 2 AM to 4 AM.",
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    },
    {
        id: "3",
        type: "claim_rejected",
        title: "Claim Rejected",
        message: "Your claim for 'Calculus Textbook' was rejected. Please provide more proof of ownership.",
        item_id: "item-456",
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
        id: "4",
        type: "ban_warning",
        title: "Account Warning",
        message: "Multiple failed claim attempts detected. Please review our community guidelines.",
        is_read: false,
        created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 hours ago
    },
    {
        id: "5",
        type: "claim_created",
        title: "New Claim Submitted",
        message: "A new claim has been submitted for your reported item 'Red Backpack'.",
        item_id: "item-789",
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 10).toISOString(), // 10 hours ago
    }
]

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "claim_approved":
                return <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30"><Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /></div>
            case "claim_rejected":
                return <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30"><X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /></div>
            case "ban_warning":
                return <div className="rounded-full bg-orange-100 p-1.5 dark:bg-orange-900/30"><AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" /></div>
            case "claim_created":
            case "system_notice":
            default:
                return <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/30"><Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /></div>
        }
    }

    const NotificationItem = ({ notification }: { notification: Notification }) => (
        <DropdownMenuItem
            className={cn(
                "flex items-start gap-3 p-3 cursor-pointer focus:bg-muted/50 rounded-lg my-1 transition-colors",
                !notification.is_read && "bg-muted/30"
            )}
            onClick={() => markAsRead(notification.id)}
        >
            <div className="mt-0.5 shrink-0">
                {getIcon(notification.type)}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-none truncate", !notification.is_read && "text-foreground")}>
                        {notification.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>
                {notification.item_id && (
                    <Link
                        href={`/items/${notification.item_id}`}
                        className="text-[10px] font-medium text-primary hover:underline mt-1.5 inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Details
                    </Link>
                )}
            </div>
            {!notification.is_read && (
                <div className="shrink-0 self-center">
                    <span className="h-2 w-2 rounded-full bg-primary block ring-2 ring-background" />
                </div>
            )}
        </DropdownMenuItem>
    )

    const EmptyState = ({ type }: { type: 'all' | 'unread' }) => (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
            <div className="bg-muted/50 p-3 rounded-full">
                <Inbox className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
                {type === 'all' ? "No notifications yet" : "No unread notifications"}
            </p>
            {type === 'unread' && (
                <Button variant="link" size="sm" className="text-xs h-auto p-0">
                    View all notifications
                </Button>
            )}
        </div>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-muted/60 transition-colors"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />

                    {unreadCount > 0 && (
                        unreadCount < 10 ? (
                            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center ring-2 ring-background">
                                {unreadCount}
                            </span>
                        ) : (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                        )
                    )}

                    <span className="sr-only">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notifications`
                            : "Notifications"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden shadow-lg border-border/60">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
                    <h2 className="font-semibold text-sm">Notifications</h2>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground hover:text-primary hover:bg-transparent gap-1.5"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <div className="px-4 pt-2">
                        <TabsList className="w-full grid grid-cols-2 h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 min-w-[1.25rem] text-[10px] font-normal">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        <div className="max-h-[400px] overflow-y-auto px-2 py-1">
                            {notifications.length === 0 ? (
                                <EmptyState type="all" />
                            ) : (
                                notifications.map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="unread" className="mt-0">
                        <div className="max-h-[400px] overflow-y-auto px-2 py-1">
                            {notifications.filter((n) => !n.is_read).length === 0 ? (
                                <EmptyState type="unread" />
                            ) : (
                                notifications
                                    .filter((n) => !n.is_read)
                                    .map((notification) => (
                                        <NotificationItem key={notification.id} notification={notification} />
                                    ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="p-2 border-t bg-muted/10 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-7 hover:bg-transparent" disabled>
                        Notifications are automatically deleted after 30 days
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
