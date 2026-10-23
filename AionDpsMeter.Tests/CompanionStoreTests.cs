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
    public void StorageRejectsWorkingDirectoryDependentPaths()
    {
        Assert.Throws<ArgumentException>(() => new CompanionStore("data"));
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
}
