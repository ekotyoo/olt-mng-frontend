export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { syncFromOlt } = await import('@/lib/sync-service');
        const POLL_INTERVAL = 30_000; // 30 seconds - balanced for near real-time with low OLT load

        console.log(`[Instrumentation] Registering OLT Background Sync (Every ${POLL_INTERVAL / 1000}s)`);

        // Prevent multiple intervals in dev HMR by assigning to global if needed, 
        // but Next.js instrumentation usually runs once server-side.
        // However, in dev mode, it might re-run.

        // Simple Interval
        setInterval(async () => {
            try {
                console.log("[Instrumentation] Running scheduled OLT Sync...");
                await syncFromOlt();
                console.log("[Instrumentation] Scheduled Sync completed.");
            } catch (e) {
                console.error("[Instrumentation] Scheduled Sync failed:", e);
            }
        }, POLL_INTERVAL);
    }
}
