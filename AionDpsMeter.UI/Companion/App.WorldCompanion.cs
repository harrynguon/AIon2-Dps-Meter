using AionDpsMeter.UI.Companion;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using System.Windows;

namespace AionDpsMeter.UI;

// World Companion hooks for App, kept out of the upstream App.xaml.cs, which only calls these methods.
public partial class App
{
    private bool companionOnly;

    /// <summary>Registers the companion module with the meter's per-user settings directory.</summary>
    private static void ConfigureWorldCompanion(IServiceCollection services) =>
        services.AddWorldCompanionHost(WorldCompanionHost.DefaultStoreDirectory);

    /// <summary>
    /// With --world-companion, opens only the companion (no packet capture or meter windows), completes
    /// startup and returns true; the application then exits when the companion closes.
    /// </summary>
    private bool TryStartCompanionOnly(StartupEventArgs e)
    {
        companionOnly = e.Args.Contains("--world-companion");
        if (!companionOnly) return false;
        AppHost.Services.GetRequiredService<WorldCompanionLauncher>().Open();
        base.OnStartup(e);
        return true;
    }

    /// <summary>
    /// In companion-only mode, stops the host without the combat-history shutdown work, which was never
    /// started, completes exit and returns true. A failure propagates to OnExit's catch, which completes exit.
    /// </summary>
    private async Task<bool> TryExitCompanionOnlyAsync(ExitEventArgs e)
    {
        if (!companionOnly) return false;
        await AppHost.StopAsync();
        await Log.CloseAndFlushAsync();
        base.OnExit(e);
        return true;
    }
}
