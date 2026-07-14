/** Recovery boundary shown when authentication cannot establish a session. */
export function AuthSyncFailure() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20 relative">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
          <img src="/favicon.png" alt="Logo" className="w-10 h-10 object-contain grayscale opacity-50 relative z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gradient uppercase tracking-tight">Sync Failure</h1>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-wider">
            The terminal failed to synchronize with the secure cloud. Please check your connection.
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl bg-muted border border-border/50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/80 active:scale-95 transition-all text-foreground/70">
          Reconnect Terminal
        </button>
      </div>
    </div>
  );
}
