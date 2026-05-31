export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">Sentinal</p>
        <h1 className="text-4xl font-semibold tracking-tight">Landing page</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Open the dashboard route to see the sidebar demo.
        </p>
        <a
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-90"
          href="/dashboard"
        >
          Go to dashboard
        </a>
      </div>
    </main>
  );
}
