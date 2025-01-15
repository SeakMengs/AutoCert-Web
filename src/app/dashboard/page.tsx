"use client";
import { useAuth } from "@/hooks/useAuth";
import { apiWithAuth } from "@/utils/axios";
import { Button, Spin } from "antd";

export default function Dashboard() {
    const { user, exp, iat, isAuthenticated, revalidate, loading, error } =
        useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Something went wrong</h1>
                <p>{error}</p>
                <Button onClick={revalidate}>Revalidate</Button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                <h1>Access Denied</h1>
                <p>
                    You are not authorized to view this page. Please log in
                    again.
                </p>
                <Button onClick={revalidate}>Revalidate</Button>
                <Button
                    onClick={async () => {
                        try {
                            const res = await apiWithAuth.get("");
                            console.log(res.data);
                        } catch (error) {
                            console.error(error);
                        }                    
                    }}
                >
                    apiWithAuth
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome to the Dashboard</h1>
            <p>
                <strong>User ID:</strong> {user.id}
            </p>
            <p>
                <strong>User Name:</strong> {user.email}
            </p>
            <p>
                <strong>Issued At:</strong>{" "}
                {new Date(iat * 1000).toLocaleString()}
            </p>
            <p>
                <strong>Expires At:</strong>{" "}
                {new Date(exp * 1000).toLocaleString()}
            </p>
            <Button onClick={revalidate}>Revalidate</Button>
        </div>
    );
}
