"use client";

import {
    createContext,
    useEffect,
    useState,
} from "react";

import type { User } from "@/types/auth";
import {
    getCurrentUser,
    LoginPayload,
    loginUser,
    logoutUser,
    refreshAccessToken,

} from "@/lib/auth";
import { clearAccessToken } from "@/lib/token";


interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login(credentials: LoginPayload): Promise<void>;
    logout(): Promise<void>;
    refreshUser(): Promise<void>;
}

export const AuthContext =
    createContext<AuthContextValue | null>(null);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {


    const [user, setUser] =
        useState<User | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const isAuthenticated =
        user !== null;

    const initialize = async () => {
        try {
            await refreshAccessToken();

            await refreshUser();
        } catch {
            clearAccessToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initialize();
    }, []);

    const login = async (credentials: LoginPayload) => {
        await loginUser(credentials);
        await refreshUser();
    };

    const logout = async () => {

        clearAccessToken();
        setUser(null);

    };

    const refreshUser = async () => {
        const me = await getCurrentUser();
        setUser(me);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}