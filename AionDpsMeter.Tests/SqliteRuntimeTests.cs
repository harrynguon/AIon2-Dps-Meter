using Microsoft.Data.Sqlite;

namespace AionDpsMeter.Tests;

public sealed class SqliteRuntimeTests
{
    [Fact]
    public void LoadedNativeSqliteIncludesCve20256965Fix()
    {
        using var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "select sqlite_version()";
        var version = Version.Parse((string)command.ExecuteScalar()!);
        Assert.True(version >= new Version(3, 50, 2), "The loaded native SQLite must include the CVE-2025-6965 fix.");
    }
}
