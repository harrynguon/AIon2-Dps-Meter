namespace AionDpsMeter.UI.Services.Windowing;

/// <summary>
/// Postpones a window close until hosted content has been released.
/// WPF disposes a window's WebView2 control when the window closes, but BlazorWebView itself is
/// never disposed automatically. A Blazor message sent after that point (for example the reply to
/// the JS call that requested the close) fails, and Blazor rethrows the failure on the UI
/// dispatcher, terminating the whole meter. Releasing content first keeps the WebView alive
/// until every component has finished disposing.
/// </summary>
/// <remarks>All members are expected to run on the window's UI thread.</remarks>
public sealed class DeferredWindowClose(Func<ValueTask> release, Action close, Action<Exception>? releaseFailed = null)
{
    private Task? releasing;
    private bool closeQueued;
    private bool closed;

    /// <summary>
    /// Called from the window's Closing handler. Returns true when this close must be cancelled
    /// because release is still running; the window is closed again once it completes.
    /// </summary>
    public bool ShouldCancelClose()
    {
        if (closed) return false;
        releasing ??= ReleaseAsync();
        // A synchronous release lets this close proceed instead of re-entering Close().
        if (releasing.IsCompleted) return false;
        if (!closeQueued)
        {
            closeQueued = true;
            _ = CloseAfterReleaseAsync(releasing);
        }
        return true;
    }

    /// <summary>Records that the window closed, including closes that could not be cancelled.</summary>
    public void MarkClosed() => closed = true;

    // Failures must not keep the window open, so they are reported and then treated as released.
    private async Task ReleaseAsync()
    {
        try { await release(); }
        catch (Exception ex) { releaseFailed?.Invoke(ex); }
    }

    private async Task CloseAfterReleaseAsync(Task pending)
    {
        await pending;
        // Close from a fresh dispatcher turn, never from inside a WebView or Closing callback.
        await Task.Yield();
        if (!closed) close();
    }
}
