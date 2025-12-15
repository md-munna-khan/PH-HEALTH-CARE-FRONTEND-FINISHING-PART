import { usePathname } from "next/navigation";

/**
 * Client hook that detects auth state on navigation
 * Checks cookie synchronously on each pathname change
 */
export function useAuthToken() {
    // pathname triggers re-render on navigation, forcing cookie re-check
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pathname = usePathname();

    // Synchronous check - no state needed
    if (typeof window === "undefined") return false;

    const cookies = document.cookie.split(";");
    const hasAccessToken = cookies.some((cookie) =>
        cookie.trim().startsWith("accessToken=")
    );

    return hasAccessToken;
}
