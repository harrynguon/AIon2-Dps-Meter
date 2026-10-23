using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using AionDpsMeter.Companion;
using AionDpsMeter.Core.Windowing;
using AionDpsMeter.Tests;
using AionDpsMeter.UI.Companion;
using AionDpsMeter.UI.Services.Windowing;
using Microsoft.AspNetCore.Components.WebView.Wpf;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Web.WebView2.Wpf;

namespace AionDpsMeter.LifecycleCheck;

/// <summary>
/// Native window lifecycle check for the World Companion. It guards the close crash fixed in b4740c5: WPF
/// disposed WebView2 while Blazor still had to reply to the JS close call, and Blazor rethrew the failed send
/// on the UI dispatcher, terminating the meter.
/// </summary>
/// <remarks>
/// The real BlazorWindow and WorldCompanion run off-screen inside a WPF application that, like the integrated
/// meter, outlives each companion. Companions are closed in turn by their close button and by WM_CLOSE, then
/// reopened; the last one is still open when the application shuts down. Any unhandled exception fails the
/// check, as it would terminate the meter. Packet capture and the meter's own windows are never created, the
/// companion store and WebView2 profile live in a scratch directory, and the page is driven through
/// CoreWebView2 script execution, so no remote-debugging port is opened.
/// Exit codes: 0 pass, 1 failed step or unhandled exception escaping the application, 2 watchdog timeout.
/// A crash on another thread ends the process with the runtime's own nonzero code.
/// </remarks>
internal static class Program
{
    private enum Ending { CloseButton, WindowMessage, ApplicationShutdown }

    // Two button closes prove reopening after a JS-requested close; WM_CLOSE is what Alt+F4 and the
    // taskbar send; the final companion stays open so shutdown has to tear it down.
    private static readonly Ending[] Sequence =
        [Ending.CloseButton, Ending.CloseButton, Ending.WindowMessage, Ending.ApplicationShutdown];

    private static readonly TimeSpan StepLimit = TimeSpan.FromSeconds(30);
    // A failed Blazor send surfaces on a later dispatcher turn, so the host keeps running after each close.
    private static readonly TimeSpan Settle = TimeSpan.FromSeconds(2);
    // Backstop for a hung UI thread, which would stop the per-step limits from firing.
    private static readonly TimeSpan Watchdog = TimeSpan.FromMinutes(3);

    [STAThread]
    private static int Main()
    {
        var scratch = Directory.CreateTempSubdirectory("ratmeter-lifecycle-").FullName;
        // Read by WebView2 when it creates its browser process: keeps the profile out of the build output.
        Environment.SetEnvironmentVariable("WEBVIEW2_USER_DATA_FOLDER", Path.Combine(scratch, "webview2"));
        using var watchdog = new Timer(_ =>
        {
            Console.Error.WriteLine($"FAIL: no result within {Watchdog.TotalMinutes} minutes.");
            Environment.Exit(2);
        }, null, Watchdog, Timeout.InfiniteTimeSpan);
        try
        {
            var app = new Application { ShutdownMode = ShutdownMode.OnExplicitShutdown };
            var services = new ServiceCollection();
            services.AddWpfBlazorWebView();
            services.AddSingleton(TestAppSettingsService.Create());
            services.AddWindowManager();
            // The meter's own companion wiring, with the store in the scratch directory.
            services.AddWorldCompanionHost(Path.Combine(scratch, "companion"));
            using var provider = services.BuildServiceProvider();

            app.Startup += async (_, _) => app.Shutdown(await RunSequenceAsync(provider) ? 0 : 1);
            var code = app.Run();
            if (code == 0)
                Console.WriteLine($"PASS: {Sequence.Length} companions opened; each close and the shutdown left no unhandled exception.");
            return code;
        }
        catch (Exception ex)
        {
            // Unhandled dispatcher exceptions escape Application.Run; in the meter they end the process.
            Console.Error.WriteLine("FAIL: unhandled exception escaped the application; the meter would have crashed.");
            Console.Error.WriteLine(ex);
            return 1;
        }
        finally
        {
            DeleteScratch(scratch);
        }
    }

    // Runs every step on the UI thread. Returns false after reporting the first failed step.
    private static async Task<bool> RunSequenceAsync(IServiceProvider services)
    {
        var windows = services.GetRequiredService<IWindowManagerService>();
        for (var i = 0; i < Sequence.Length; i++)
        {
            var label = $"companion {i + 1}";
            try
            {
                var (window, webView) = await OpenAsync(services, windows);
                var events = await WaitForRenderAsync(webView);
                Console.WriteLine($"{label}: rendered {events} events");
                if (Sequence[i] == Ending.ApplicationShutdown)
                {
                    Console.WriteLine($"{label}: shutting down with the companion open");
                    return true;
                }

                var closed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
                window.Closed += (_, _) => closed.TrySetResult();
                if (Sequence[i] == Ending.CloseButton)
                {
                    // Queued so the click runs as its own task, like a real click, not inside this script call.
                    await webView.CoreWebView2.ExecuteScriptAsync(
                        "setTimeout(() => document.querySelector('[data-action=close]').click(), 0)");
                }
                else if (!PostMessage(new WindowInteropHelper(window).Handle, WmClose, 0, 0))
                {
                    throw new CheckFailedException("WM_CLOSE could not be posted");
                }
                await WithinStepLimit(closed.Task, "did not close");
                if (windows.IsOpen(WindowKey.WorldCompanion))
                    throw new CheckFailedException("still tracked as open after closing");
                await Task.Delay(Settle);
                Console.WriteLine($"{label}: closed by {Describe(Sequence[i])}; host still running");
            }
            catch (CheckFailedException ex)
            {
                Console.Error.WriteLine($"FAIL: {label}: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                // A step of the check itself threw (for example a WebView2 call). A meter-style crash is raised
                // on the dispatcher by Blazor, never into this method, so it still escapes Application.Run.
                Console.Error.WriteLine($"FAIL: {label}: check step error");
                Console.Error.WriteLine(ex);
                return false;
            }
        }
        return true;
    }

    // Opens the companion the way the meter does (singleton slot) and waits for its WebView2 to initialize.
    private static async Task<(BlazorWindow Window, WebView2CompositionControl WebView)> OpenAsync(
        IServiceProvider services, IWindowManagerService windows)
    {
        var window = new BlazorWindow(services, typeof(WorldCompanion))
        {
            Title = "RATmeter lifecycle check", Width = 900, Height = 700,
            // Off-screen and never activated, so whatever is in the foreground keeps focus.
            WindowStartupLocation = WindowStartupLocation.Manual, Left = -6000, Top = -6000,
            ShowActivated = false, ShowInTaskbar = false,
        };
        var initialized = new TaskCompletionSource<WebView2CompositionControl>(
            TaskCreationOptions.RunContinuationsAsynchronously);
        ((BlazorWebView)window.Content).BlazorWebViewInitialized += (_, e) => initialized.TrySetResult(e.WebView);
        windows.Open(WindowKey.WorldCompanion, window, isSingleton: true);
        if (!windows.IsOpen(WindowKey.WorldCompanion))
            throw new CheckFailedException("not tracked as open");
        return (window, await WithinStepLimit(initialized.Task, "WebView2 did not initialize"));
    }

    // Awaits a step's result, turning a timeout into a labelled check failure.
    private static async Task<T> WithinStepLimit<T>(Task<T> task, string failure)
    {
        await WithinStepLimit((Task)task, failure);
        return await task;
    }

    // Awaits a step, turning a timeout into a labelled check failure.
    private static async Task WithinStepLimit(Task task, string failure)
    {
        try { await task.WaitAsync(StepLimit); }
        catch (TimeoutException) { throw new CheckFailedException($"{failure} within {StepLimit.TotalSeconds} s"); }
    }

    // Events render, and the close handler is wired, only after companion.mjs has mounted and the native
    // Load bridge has answered, so a nonzero count means the close button is live.
    private static async Task<int> WaitForRenderAsync(WebView2CompositionControl webView)
    {
        var deadline = DateTime.UtcNow + StepLimit;
        while (DateTime.UtcNow < deadline)
        {
            var result = await webView.CoreWebView2.ExecuteScriptAsync(
                "document.querySelector('[data-action=close]') ? document.querySelectorAll('.wc-event').length : 0");
            if (int.TryParse(result, out var events) && events > 0) return events;
            await Task.Delay(250);
        }
        throw new CheckFailedException($"the companion did not render within {StepLimit.TotalSeconds} s");
    }

    // Progress wording for a close step.
    private static string Describe(Ending ending) =>
        ending == Ending.CloseButton ? "its close button" : "WM_CLOSE (as Alt+F4 sends)";

    // Best effort: WebView2 processes release the profile shortly after a clean shutdown, but keep it while a
    // companion is still open after a crash. A leftover path is printed; a watchdog exit skips cleanup.
    private static void DeleteScratch(string scratch)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            try
            {
                Directory.Delete(scratch, recursive: true);
                return;
            }
            catch (IOException) { Thread.Sleep(500); }
            catch (UnauthorizedAccessException) { Thread.Sleep(500); }
        }
        Console.Error.WriteLine($"note: scratch directory left behind: {scratch}");
    }

    private const uint WmClose = 0x0010;

    // Queues a window message, so WM_CLOSE arrives on a fresh dispatcher turn as it does from Alt+F4.
    [DllImport("user32.dll", EntryPoint = "PostMessageW", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool PostMessage(nint hWnd, uint msg, nint wParam, nint lParam);

    // An expected way for a step to fail (timeout or wrong state), reported without a stack trace.
    private sealed class CheckFailedException(string message) : Exception(message);
}
