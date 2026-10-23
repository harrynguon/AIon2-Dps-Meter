namespace AionDpsMeter.UI.Services.Windowing;

/// <summary>
/// Postpones a window close until hosted content has been released.
/// WPF disposes a window's WebView2 control when the window closes, but BlazorWebView itself is
/// never disposed automatically. A Blazor message sent after that point (for example the reply to
/// the JS call that requested the close) fails, and Blazor rethrows the failure on the UI
/// dispatcher, terminating the whole meter. Releasing content first keeps the WebView alive
/// until every component has finished disposing.
/// </summary>
/// <remarks>
/// All members are expected to run on the window's UI thread. Release never starts inside the
/// caller of Close(): even a fully synchronous release would otherwise dispose the WebView before
/// a JS interop caller could send its reply.
/// </remarks>
public sealed class DeferredWindowClose(Func<ValueTask> release, Action close, Action<Exception>? releaseFailed = null)
{
    private Task? closing;
    private bool released;
    private bool closed;

    /// <summary>Completes when the deferred release and close have finished or were skipped.</summary>
    public Task Completion => closing ?? Task.CompletedTask;

    /// <summary>
    /// Called from the window's Closing handler. Returns true when this close must be cancelled;
    /// the window is closed again once release completes on a later dispatcher turn.
    /// </summary>
    public bool ShouldCancelClose()
    {
        if (closed || released) return false;
        closing ??= ReleaseThenCloseAsync();
        return true;
    }

    /// <summary>Records that the window closed, including closes that could not be cancelled.</summary>
    public void MarkClosed() => closed = true;

    // A forced close (application shutdown) destroys the WebView before the deferred turn runs;
    // release is then skipped because any component message would reach a disposed WebView.
    private async Task ReleaseThenCloseAsync()
    {
        await Task.Yield();
        if (!closed)
        {
            // Failures must not keep the window open, so they are reported and treated as released.
            try { await release(); }
            catch (Exception ex) { releaseFailed?.Invoke(ex); }
        }
        released = true;
        // Close from a fresh dispatcher turn, never from inside a WebView callback.
        await Task.Yield();
        if (!closed) close();
    }
}
