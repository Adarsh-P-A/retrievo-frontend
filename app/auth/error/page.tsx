'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const errorMap: Record<string, { title: string; message: string }> = {
        Configuration: {
            title: "Configuration Error",
            message: "There is a problem with the server configuration. Check if your options are correct."
        },
        AccessDenied: {
            title: "Access Denied",
            message: "You do not have permission to sign in. Please use NITC Email to sign in."
        },
        Verification: {
            title: "Verification Error",
            message: "The sign in link is no longer valid. It may have been used already or it may have expired."
        },
        BackendAuthFailed: {
            title: "Backend Authentication Failed",
            message: "Failed to authenticate with the backend service. Please try again later."
        },
        NoEmail: {
            title: "Email Not Provided",
            message: "No email address was provided by the authentication provider. Please ensure your account has a valid email."
        },
        Default: {
            title: "Authentication Error",
            message: "An error occurred while trying to authenticate. Please try again."
        }
    }

    const { title, message } = errorMap[error as string] || errorMap.Default

    return (
        <div className="relative overflow-hidden bg-background flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-muted/30"></div>

            <Card className="w-full max-w-md shadow-xl border-destructive/20 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center space-y-4 pb-2 pt-8">
                    <div className="mx-auto bg-destructive/10 p-4 rounded-2xl w-fit mb-2 ring-1 ring-destructive/20">
                        <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight text-destructive">{title}</CardTitle>
                        <CardDescription className="text-base">
                            {message}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground text-sm p-8 pt-2 pb-6">
                    If this persists, please contact support or try a different sign-in method.
                </CardContent>
                <CardFooter className="flex flex-col gap-3 p-8 pt-0">
                    <Button variant="outline" className="w-full h-12 text-base font-medium cursor-pointer hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all" asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <Suspense>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}