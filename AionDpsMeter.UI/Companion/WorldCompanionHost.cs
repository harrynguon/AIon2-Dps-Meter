using System.IO;
using System.Windows;
using AionDpsMeter.Companion;
using AionDpsMeter.Core.Windowing;
using AionDpsMeter.Services.Services.Settings;
using AionDpsMeter.UI.Services.Windowing;
using Microsoft.Extensions.DependencyInjection;

namespace AionDpsMeter.UI.Companion;

/// <summary>
/// Meter-side adapter for the World Companion module (AionDpsMeter.Companion). Everything the meter needs to
/// host the companion lives in this folder, so upstream files keep one-line hooks (docs/ARCHITECTURE.md,
/// "Fork boundary").
/// </summary>
public static class WorldCompanionHost
{
    /// <summary>
    /// Per-user directory holding companion settings. Existing saves live here, so it must not change;
    /// tests and native checks pass their own scratch directory instead.
    /// </summary>
    public static string DefaultStoreDirectory => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "HarryNguon", "RATmeter", "WorldCompanion");

    /// <summary>
    /// Registers the module rooted in <paramref name="storeDirectory"/>, the meter's window operations for it
    /// and <see cref="WorldCompanionLauncher"/>. Requires the meter's window manager and settings services.
    /// </summary>
    public static IServiceCollection AddWorldCompanionHost(this IServiceCollection services, string storeDirectory)
    {
        services.AddWorldCompanion(storeDirectory);
        services.AddSingleton<ICompanionWindow, CompanionWindowActions>();
        services.AddSingleton<WorldCompanionLauncher>();
        return services;
    }
}

/// <summary>Companion window operations backed by the meter's window manager.</summary>
internal sealed class CompanionWindowActions(IWindowManagerService windows) : ICompanionWindow
{
    // Native drag of the companion window from the page's Move button.
    public void Drag() => windows.Drag(WindowKey.WorldCompanion);

    // BlazorWindow defers the actual teardown until this JS-initiated call has replied.
    public void Close() => windows.Close(WindowKey.WorldCompanion);
}

/// <summary>Opens the single companion window in a BlazorWindow, or focuses it when already open.</summary>
public sealed class WorldCompanionLauncher(IServiceProvider services, IWindowManagerService windows, IAppSettingsService settings)
{
    /// <summary>
    /// Opens or focuses the companion. With <paramref name="rememberBounds"/>, its position and size are
    /// restored and saved through the meter's settings; companion-only mode leaves them alone.
    /// </summary>
    public void Open(Window? owner = null, bool rememberBounds = false)
    {
        // WPF keeps every constructed window until exit and closes it then, firing Closing, so a window is
        // only constructed when none is open.
        if (windows.IsOpen(WindowKey.WorldCompanion))
        {
            windows.Focus(WindowKey.WorldCompanion);
            return;
        }
        var window = new BlazorWindow(services, typeof(WorldCompanion))
        {
            Title = "RATmeter World Companion", Width = 1060, Height = 820,
            MinWidth = 700, MinHeight = 550, ResizeMode = ResizeMode.CanResizeWithGrip
        };
        if (rememberBounds)
        {
            // Closing runs again after deferred Blazor teardown; only real, finite bounds are saved.
            window.Closing += (_, _) =>
            {
                if (window.IsLoaded && window.WindowState == WindowState.Normal &&
                    double.IsFinite(window.Left) && double.IsFinite(window.Top))
                    settings.SetWindowBounds(WindowKey.WorldCompanion, new WindowBounds
                    { Left = window.Left, Top = window.Top, Width = window.Width, Height = window.Height });
            };
        }
        windows.Open(WindowKey.WorldCompanion, window, isSingleton: true, owner: owner,
            persistenceMode: rememberBounds ? WindowPersistenceMode.Bounds : WindowPersistenceMode.None);
    }
}
