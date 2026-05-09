"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { IntlProvider } from "@/app/components/IntlProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <IntlProvider>
                    {children}
                </IntlProvider>
            </UserProfileProvider>
        </AuthProvider>
    );
}
