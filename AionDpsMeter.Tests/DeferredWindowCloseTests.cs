using AionDpsMeter.UI.Services.Windowing;

namespace AionDpsMeter.Tests;

// Close ordering for Blazor windows: content is released before the native WebView is destroyed.
public sealed class DeferredWindowCloseTests
{
    private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(5);

    [Fact]
    public async Task FirstCloseWaitsForReleaseThenClosesOnce()
    {
        var release = new TaskCompletionSource();
        var closed = new TaskCompletionSource();
        var releases = 0;
        var closes = 0;
        var gate = new DeferredWindowClose(
            () => { releases++; return new ValueTask(release.Task); },
            () => { closes++; closed.TrySetResult(); });

        Assert.True(gate.ShouldCancelClose());
        Assert.True(gate.ShouldCancelClose());
        Assert.Equal(1, releases);
        Assert.Equal(0, closes);

        release.SetResult();
        await closed.Task.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.False(gate.ShouldCancelClose());
        Assert.Equal(1, releases);
        Assert.Equal(1, closes);
    }

    [Fact]
    public void SynchronousReleaseLetsTheCurrentCloseProceed()
    {
        var closes = 0;
        var gate = new DeferredWindowClose(() => ValueTask.CompletedTask, () => closes++);

        Assert.False(gate.ShouldCancelClose());
        Assert.Equal(0, closes);
    }

    [Fact]
    public async Task ReleaseFailureIsReportedAndStillCloses()
    {
        var closed = new TaskCompletionSource();
        Exception? reported = null;
        var gate = new DeferredWindowClose(
            async () => { await Task.Yield(); throw new InvalidOperationException("disposal failed"); },
            () => closed.TrySetResult(),
            ex => reported = ex);

        Assert.True(gate.ShouldCancelClose());
        await closed.Task.WaitAsync(Timeout, TestContext.Current.CancellationToken);
        Assert.IsType<InvalidOperationException>(reported);
        Assert.False(gate.ShouldCancelClose());
    }

    [Fact]
    public void SynchronousReleaseFailureDoesNotBlockClosing()
    {
        Exception? reported = null;
        var gate = new DeferredWindowClose(
            () => throw new InvalidOperationException("disposal failed"),
            () => { },
            ex => reported = ex);

        Assert.False(gate.ShouldCancelClose());
        Assert.NotNull(reported);
    }

    [Fact]
    public async Task ForcedCloseDuringReleaseIsNotRepeated()
    {
        var release = new TaskCompletionSource();
        var closes = 0;
        var gate = new DeferredWindowClose(() => new ValueTask(release.Task), () => closes++);

        Assert.True(gate.ShouldCancelClose());
        // Application shutdown ignores the cancellation and closes the window anyway.
        gate.MarkClosed();
        release.SetResult();
        await Task.Delay(100, TestContext.Current.CancellationToken);
        Assert.Equal(0, closes);
        Assert.False(gate.ShouldCancelClose());
    }
}
