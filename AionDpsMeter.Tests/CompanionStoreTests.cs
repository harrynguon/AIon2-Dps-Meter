using AionDpsMeter.Services.Services.Settings;
using System.IO;

namespace AionDpsMeter.Tests;

public sealed class CompanionStoreTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "ratmeter-tests-" + Guid.NewGuid());
    [Fact]
    public void SavesAcrossInstancesAndPreservesPreviousVersion()
    {
        var store = new CompanionStore(directory);
        Assert.Null(store.Load());
        store.Save("{\"version\":1,\"profile\":\"Elyos\"}");
        store.Save("{\"version\":1,\"profile\":\"Alt\"}");
        Assert.Contains("Alt", new CompanionStore(directory).Load());
        Assert.Contains("Elyos", File.ReadAllText(Path.Combine(directory, "companion.json.bak")));
    }
    [Fact]
    public void InvalidSaveDoesNotOverwriteProgress()
    {
        var store = new CompanionStore(directory);
        store.Save("{\"version\":1}");
        Assert.ThrowsAny<Exception>(() => store.Save("not json"));
        Assert.Throws<ArgumentException>(() => store.Save("{\"version\":2}"));
        Assert.Equal("{\"version\":1}", store.Load());
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
}
