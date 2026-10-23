using AionDpsMeter.UI.Services.Windowing;

namespace AionDpsMeter.Tests;

// Close ordering for Blazor windows: content is released before the native WebView is destroyed,
// and never inside the call that requested the close.
public sealed class DeferredWindowCloseTests
{
    private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(5);

    [Fact]
    public async Task FirstCloseWaitsForReleaseThenClosesOnce()
    {
        var started = new TaskCompletionSource();
        var release = new TaskCompletionSource();
        var releases = 0;
        var closes = 0;
        var gate = new DeferredWindowClose(
            () => { releases++; started.TrySetResult(); return new ValueTask(release.Task); },
            () => closes++);

        Assert.True(gate.ShouldCancelClose());
        Assert.True(gate.ShouldCancelClose());
        await started.Task.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.Equal(0, closes);

        release.SetResult();
        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.False(gate.ShouldCancelClose());
        Assert.Equal(1, releases);
        Assert.Equal(1, closes);
    }

    [Fact]
    public async Task SynchronousReleaseStillRunsOutsideTheClosingCall()
    {
        var releases = 0;
        var closes = 0;
        var gate = new DeferredWindowClose(() => { releases++; return ValueTask.CompletedTask; }, () => closes++);

        // A JS-requested close must return (and reply) before the WebView can be disposed.
        Assert.True(gate.ShouldCancelClose());
        Assert.Equal(0, releases);

        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.Equal(1, releases);
        Assert.Equal(1, closes);
        Assert.False(gate.ShouldCancelClose());
    }

    [Fact]
    public async Task ReleaseFailureIsReportedAndStillCloses()
    {
        Exception? reported = null;
        var closes = 0;
        var gate = new DeferredWindowClose(
            async () => { await Task.Yield(); throw new InvalidOperationException("disposal failed"); },
            () => closes++,
            ex => reported = ex);

        Assert.True(gate.ShouldCancelClose());
        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.IsType<InvalidOperationException>(reported);
        Assert.Equal(1, closes);
        Assert.False(gate.ShouldCancelClose());
    }

    [Fact]
    public async Task SynchronousReleaseFailureDoesNotBlockClosing()
    {
        Exception? reported = null;
        var closes = 0;
        var gate = new DeferredWindowClose(
            () => throw new InvalidOperationException("disposal failed"),
            () => closes++,
            ex => reported = ex);

        Assert.True(gate.ShouldCancelClose());
        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.NotNull(reported);
        Assert.Equal(1, closes);
    }

    [Fact]
    public async Task ForcedCloseBeforeReleaseSkipsReleaseAndClose()
    {
        var releases = 0;
        var closes = 0;
        var gate = new DeferredWindowClose(() => { releases++; return ValueTask.CompletedTask; }, () => closes++);

        Assert.True(gate.ShouldCancelClose());
        // Application shutdown ignores the cancellation and destroys the WebView immediately.
        gate.MarkClosed();
        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.Equal(0, releases);
        Assert.Equal(0, closes);
        Assert.False(gate.ShouldCancelClose());
    }

    [Fact]
    public async Task ForcedCloseDuringReleaseIsNotRepeated()
    {
        var started = new TaskCompletionSource();
        var release = new TaskCompletionSource();
        var closes = 0;
        var gate = new DeferredWindowClose(
            () => { started.TrySetResult(); return new ValueTask(release.Task); },
            () => closes++);

        Assert.True(gate.ShouldCancelClose());
        await started.Task.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        gate.MarkClosed();
        release.SetResult();
        await gate.Completion.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.Equal(0, closes);
    }
}
