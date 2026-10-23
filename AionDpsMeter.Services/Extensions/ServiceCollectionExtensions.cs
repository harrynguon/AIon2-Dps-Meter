using AionDpsMeter.Services.PacketProcessing;
using AionDpsMeter.Services.PacketProcessing.Routing;
using AionDpsMeter.Services.Services.Session.Persistence;
using AionDpsMeter.Services.Services.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AionDpsMeter.Services.Extensions
{
    public static class ServiceCollectionExtensions
    {
        extension(IServiceCollection services)
        {
            public IServiceCollection AddCombatHistoryPersistence(string sqlitePath)
            {
                var fullPath = Path.GetFullPath(sqlitePath);
                var directory = Path.GetDirectoryName(fullPath);
                if (!string.IsNullOrWhiteSpace(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                services.AddDbContextFactory<CombatHistoryDbContext>(options =>
                {
                    options.UseSqlite($"Data Source={fullPath}");
                });

                services.AddSingleton<ICombatHistoryStore, CombatHistoryStore>();
                return services;
            }

            /// <summary>
            /// Registers the one companion store shared by every companion window. The meter passes
            /// CompanionStore.DefaultDirectory; checks pass a scratch directory so a player's saves are never touched.
            /// The store (and its absolute-path validation) is created when a companion first opens, so a bad
            /// location does not stop meter startup. Opening the companion then fails like any other component
            /// activation error, which Blazor rethrows on the UI dispatcher.
            /// </summary>
            public IServiceCollection AddCompanionStore(string directory)
            {
                services.AddSingleton(_ => new CompanionStore(directory));
                return services;
            }

            public IServiceCollection AddPacketProcessingRouting()
            {
                var assembly = typeof(PacketProcessor).Assembly;

                var processorTypes = assembly.GetTypes()
                    .Where(t =>
                        t is { IsClass: true, IsAbstract: false } &&
                        t.Namespace is not null &&
                        t.Namespace.Contains(".PacketProcessing.Processors"))
                    .ToArray();

                foreach (var processorType in processorTypes)
                {
                    services.AddSingleton(processorType);
                }

                foreach (var opcodeProcessorType in processorTypes.Where(t => typeof(IOpcodeProcessor).IsAssignableFrom(t)))
                {
                    services.AddSingleton(typeof(IOpcodeProcessor),
                        sp => (IOpcodeProcessor)sp.GetRequiredService(opcodeProcessorType));
                }

                services.AddSingleton<PacketProcessor>();
                services.AddSingleton<OpcodeProcessorRegistry>();
                services.AddSingleton<PacketDispatchService>();

                return services;
            }
        }
    }
}
