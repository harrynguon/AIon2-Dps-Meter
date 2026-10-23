using AionDpsMeter.Companion;
using AionDpsMeter.UI.Companion;
using AionDpsMeter.UI.Services.Windowing;
using Microsoft.Extensions.DependencyInjection;
using System.IO;
using System.Text.Json;

namespace AionDpsMeter.Tests;

// The fork boundary: the companion module stays independent of the meter, and the meter's adapter keeps
// existing saves where they are.
public sealed class WorldCompanionHostTests
{
    [Fact]
    public void CompanionModuleReferencesNoMeterAssembly()
    {
        // A reference to Core, Services or UI would tie the module to upstream code and block extraction.
        var meterReferences = typeof(CompanionStore).Assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .Where(name => name is not null && name.StartsWith("AionDpsMeter.", StringComparison.Ordinal));
        Assert.Empty(meterReferences);
    }

    [Fact]
    public void CompanionModuleDeclaresNoMeterProjectReference()
    {
        // The compiled module only lists references it uses; the build's dependency graph also records an
        // unused ProjectReference, which would still couple the module's build to upstream projects.
        using var deps = JsonDocument.Parse(File.ReadAllText(
            Path.Combine(AppContext.BaseDirectory, "AionDpsMeter.Tests.deps.json")));
        var module = deps.RootElement.GetProperty("targets").EnumerateObject().First().Value.EnumerateObject()
            .Single(library => library.Name.StartsWith("AionDpsMeter.Companion/", StringComparison.Ordinal));
        var meterDependencies = module.Value.TryGetProperty("dependencies", out var dependencies)
            ? dependencies.EnumerateObject().Select(d => d.Name)
                .Where(name => name.StartsWith("AionDpsMeter.", StringComparison.Ordinal)).ToList()
            : [];
        Assert.Empty(meterDependencies);
    }

    [Fact]
    public void DefaultStoreDirectoryKeepsTheExistingPerUserLocation()
    {
        // Players' saves already live here; moving it would silently start them from defaults.
        var root = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        Assert.True(Path.IsPathFullyQualified(WorldCompanionHost.DefaultStoreDirectory));
        Assert.Equal(Path.Combine(root, "HarryNguon", "RATmeter", "WorldCompanion"), WorldCompanionHost.DefaultStoreDirectory);
    }

    [Fact]
    public void HostRegistrationSuppliesEverythingTheCompanionPageInjects()
    {
        var directory = Path.Combine(Path.GetTempPath(), "ratmeter-tests-" + Guid.NewGuid());
        using var provider = new ServiceCollection()
            .AddSingleton(TestAppSettingsService.Create())
            .AddWindowManager()
            .AddWorldCompanionHost(directory)
            .BuildServiceProvider();
        Assert.NotNull(provider.GetRequiredService<ICompanionWindow>());
        Assert.NotNull(provider.GetRequiredService<WorldCompanionLauncher>());
        Assert.Same(provider.GetRequiredService<CompanionStore>(), provider.GetRequiredService<CompanionStore>());
        Assert.False(Directory.Exists(directory));
    }
}
