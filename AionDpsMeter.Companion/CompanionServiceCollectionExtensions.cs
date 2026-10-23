using Microsoft.Extensions.DependencyInjection;

namespace AionDpsMeter.Companion;

/// <summary>Registers the World Companion module with a host's services.</summary>
public static class CompanionServiceCollectionExtensions
{
    /// <summary>
    /// Registers the one companion store shared by every companion window, rooted in a host-chosen absolute
    /// directory. The host must also register <see cref="ICompanionWindow"/>. The store, and its path
    /// validation, is created when a companion first opens, so a bad location cannot stop host startup.
    /// </summary>
    public static IServiceCollection AddWorldCompanion(this IServiceCollection services, string storeDirectory)
    {
        services.AddSingleton(_ => new CompanionStore(storeDirectory));
        return services;
    }
}
