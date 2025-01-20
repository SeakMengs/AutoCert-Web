import { validateAccessToken } from "@/utils/auth";
import { Button } from "antd";
import Link from "next/link";

export default async function Home() {
    const result = await validateAccessToken();

    return (
        <div>
            <h1>AutoCert</h1>
            <p>
                A Bulk Certificate Creation, E-Signing, and Certificate
                Repository Platform
            </p>
            <Link href="/dashboard">
                <Button variant="filled">To dashboard</Button>
            </Link>
            <Link href="/api/oauth/google">
                <Button variant="filled">Login with google</Button>
            </Link>
            {result && (
                <div>
                    <p>
                        <strong>User ID:</strong> {result.user?.id}
                    </p>
                    <p>
                        <strong>User Name:</strong> {result.user?.email}
                    </p>
                </div>
            )}
        </div>
    );
}