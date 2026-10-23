using System.Text;
using System.Text.Json;

namespace AionDpsMeter.Services.Services.Settings;

/// <summary>Companion settings are independent of combat history and application updates.</summary>
public sealed class CompanionStore
{
    /// <summary>
    /// Schema version written by companion state.mjs (timer-only since cube tracking was removed).
    /// Older files are still loaded and migrated by the companion; only the current version is written.
    /// </summary>
    public const int SchemaVersion = 2;

    private readonly string path;
    private readonly Lock gate = new();

    public CompanionStore(string directory)
    {
        if (!Path.IsPathFullyQualified(directory))
            throw new ArgumentException("Companion storage requires an absolute directory.", nameof(directory));
        path = Path.Combine(directory, "companion.json");
    }

    public string? Load()
    {
        lock (gate)
        {
            if (!File.Exists(path)) return null;
            if (new FileInfo(path).Length > 2_000_000)
                throw new InvalidDataException("Companion data exceeds the size limit.");
            return File.ReadAllText(path);
        }
    }

    public void Save(string json)
    {
        if (Encoding.UTF8.GetByteCount(json) > 2_000_000)
            throw new ArgumentException("Companion data exceeds the size limit.");
        using var document = JsonDocument.Parse(json);
        if (document.RootElement.ValueKind != JsonValueKind.Object ||
            !document.RootElement.TryGetProperty("version", out var version) ||
            version.ValueKind != JsonValueKind.Number || !version.TryGetInt32(out var number) || number != SchemaVersion)
            throw new ArgumentException("Unsupported companion data version.");
        lock (gate)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            var temporary = path + ".tmp";
            File.WriteAllText(temporary, json, new UTF8Encoding(false));
            // Preserve the previous state, including a malformed file, for recovery.
            if (File.Exists(path)) File.Replace(temporary, path, path + ".bak");
            else File.Move(temporary, path);
        }
    }
}
