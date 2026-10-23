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
        store.Save("{\"version\":2,\"offset\":9}");
        store.Save("{\"version\":2,\"offset\":10}");
        Assert.Contains("\"offset\":10", new CompanionStore(directory).Load());
        Assert.Contains("\"offset\":9", File.ReadAllText(Path.Combine(directory, "companion.json.bak")));
    }
    [Fact]
    public void InvalidSaveDoesNotOverwriteProgress()
    {
        var store = new CompanionStore(directory);
        store.Save("{\"version\":2}");
        Assert.ThrowsAny<Exception>(() => store.Save("not json"));
        // Retired cube-era, future and non-numeric versions are never written.
        foreach (var version in new[] { "1", "3", "\"2\"", "2.5" })
            Assert.Throws<ArgumentException>(() => store.Save("{\"version\":" + version + "}"));
        Assert.Equal("{\"version\":2}", store.Load());
    }
    [Fact]
    public void OversizedDataIsRejectedWithoutLosingTheFile()
    {
        var store = new CompanionStore(directory);
        Directory.CreateDirectory(directory);
        var path = Path.Combine(directory, "companion.json");
        File.WriteAllText(path, new string('x', 2_000_001));
        Assert.Throws<InvalidDataException>(() => store.Load());
        Assert.Equal(2_000_001, new FileInfo(path).Length);
        Assert.Throws<ArgumentException>(() => store.Save(new string('x', 2_000_001)));
        Assert.Equal(2_000_001, new FileInfo(path).Length);
    }
    [Fact]
    public void CubeEraSaveLoadsUnchangedAndIsRetainedAsBackup()
    {
        // The companion migrates version 1 in JavaScript; the store must not alter or discard it.
        const string legacy = "{\"version\":1,\"offset\":9,\"profile\":\"Example\",\"profiles\":{\"Example\":{\"verteron_A\":true}}}";
        Directory.CreateDirectory(directory);
        File.WriteAllText(Path.Combine(directory, "companion.json"), legacy);
        var store = new CompanionStore(directory);
        Assert.Equal(legacy, store.Load());
        store.Save("{\"version\":" + CompanionStore.SchemaVersion + ",\"offset\":9}");
        Assert.Equal(legacy, File.ReadAllText(Path.Combine(directory, "companion.json.bak")));
    }
    [Fact]
    public void StorageRejectsWorkingDirectoryDependentPaths()
    {
        Assert.Throws<ArgumentException>(() => new CompanionStore("data"));
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
}
