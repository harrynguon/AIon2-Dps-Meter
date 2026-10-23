using AionDpsMeter.Services.Services.Session;
using AionDpsMeter.Services.Services.Settings;
using AionDpsMeter.Services.Services.Update;
using AionDpsMeter.Core.Windowing;
using AionDpsMeter.UI.Pages;
using AionDpsMeter.UI.ViewModels;
using AionDpsMeter.UI.Views;
using Microsoft.Extensions.DependencyInjection;

namespace AionDpsMeter.UI.Services.Windowing
{
    public class WindowHelper
    {
        //window states
        public EventHandler? WindowStateUpdated { get; set; }
        public bool IsBuffEdit { get; private set; }
        public bool IsSkillCdEdit { get; private set; }

        private bool IsBuffOverlayEnabled { get; set; }
        private bool IsSkillCdOverlayEnabled { get; set; }

        private MainWindow MainWindow => serviceProvider.GetRequiredService<MainWindow>();

        private readonly IWindowManagerService windowManager;
        private readonly IServiceProvider serviceProvider;
        private readonly CombatSessionManager sessionManager;
        private readonly IAppSettingsService settingsService;
        private readonly UpdateCheckerService updateService;

        public WindowHelper(IWindowManagerService windowManager, IServiceProvider serviceProvider, CombatSessionManager sessionManager, IAppSettingsService settingsService, UpdateCheckerService updateService)
        {

            this.windowManager = windowManager;
            this.serviceProvider = serviceProvider;
            this.sessionManager = sessionManager;
            this.settingsService = settingsService;
            this.updateService = updateService;

            IsBuffOverlayEnabled = settingsService.BufOverlaySettings.Enabled;
            IsSkillCdOverlayEnabled = settingsService.SkillCdOverlaySettings.Enabled;
            settingsService.SettingsChanged += SettingsChanged;
        }

        private void SettingsChanged(object? sender, EventArgs e)
        {
            if (IsBuffOverlayEnabled != settingsService.BufOverlaySettings.Enabled)
            {
                IsBuffOverlayEnabled = settingsService.BufOverlaySettings.Enabled;
                ManageBuffOverlay();
            }

            if (IsSkillCdOverlayEnabled != settingsService.SkillCdOverlaySettings.Enabled)
            {
                IsSkillCdOverlayEnabled = settingsService.SkillCdOverlaySettings.Enabled;
                ManageSkillCdOverlay();
            }
                
        }

        public void OpenRequiredWindows()
        {
            ManageBuffOverlay();
            ManageSkillCdOverlay();
            windowManager.SetClickThrough(WindowKey.BuffOverlay);
            windowManager.SetClickThrough(WindowKey.SkillCdOverlay);
        }


        // Focuses an open companion instead of constructing a window that would never be shown:
        // WPF keeps every constructed window until exit and closes it then, firing Closing.
        public void OpenWorldCompanion()
        {
            if (windowManager.IsOpen(WindowKey.WorldCompanion))
            {
                windowManager.Focus(WindowKey.WorldCompanion);
                return;
            }
            var win = new BlazorWindow(App.AppHost.Services, typeof(WorldCompanion))
            {
                Title = "RATmeter World Companion", Width = 1060, Height = 820,
                MinWidth = 700, MinHeight = 550, ResizeMode = System.Windows.ResizeMode.CanResizeWithGrip
            };
            // Closing runs again after deferred Blazor teardown; only real, finite bounds are saved.
            win.Closing += (_, _) =>
            {
                if (win.IsLoaded && win.WindowState == System.Windows.WindowState.Normal &&
                    double.IsFinite(win.Left) && double.IsFinite(win.Top))
                    settingsService.SetWindowBounds(WindowKey.WorldCompanion, new WindowBounds
                    { Left = win.Left, Top = win.Top, Width = win.Width, Height = win.Height });
            };
            windowManager.Open(WindowKey.WorldCompanion, win, true, owner: MainWindow, persistenceMode: WindowPersistenceMode.Bounds);
        }

        public void OpenSettings()
        {
            IsBuffEdit = true;
            IsSkillCdEdit = true;
            windowManager.RestoreClickThrough(WindowKey.BuffOverlay);
            windowManager.RestoreClickThrough(WindowKey.SkillCdOverlay);
            WindowStateUpdated?.Invoke(this, EventArgs.Empty);
            var win = new BlazorWindow(App.AppHost.Services, typeof(SettingsPage))
            {
                Width = 500,
                Height = 900,
            };
            windowManager.Open(WindowKey.Settings, win, isSingleton: true, owner: MainWindow);
        }

        public void CloseSettings()
        {
            IsBuffEdit = false;
            IsSkillCdEdit = false;
            windowManager.SetClickThrough(WindowKey.BuffOverlay);
            windowManager.SetClickThrough(WindowKey.SkillCdOverlay);
            WindowStateUpdated?.Invoke(this, EventArgs.Empty);
            windowManager.Hide(WindowKey.Settings);
        }
        public void OpenHistory()
        {
            var historyWindow = new HistoryWindow(sessionManager, settingsService)
            {
                DataContext = new ViewModels.History.HistoryViewModel(sessionManager, settingsService),
                Owner = MainWindow
            };
            windowManager.Open(WindowKey.History, historyWindow, true, null, MainWindow);
        }

        public void OpenStatEff()
        {
            var statEfficiencyCalculatorViewModel  =new StatEfficiencyCalculatorViewModel(settingsService);
            statEfficiencyCalculatorViewModel.LoadFromSnapshot(sessionManager.GetCurrentPlayerStatSnapshot());
            var statEfficiencyCalculatorWindow = new StatEfficiencyCalculatorWindow
            {
                DataContext = statEfficiencyCalculatorViewModel,
                Owner = MainWindow,
            };

            windowManager.Open(WindowKey.StatEfficiencyCalculator, statEfficiencyCalculatorWindow, true, null, MainWindow);
        }

        public void OpenWhatsNewWindow()
        {
            if (updateService.LatestReleaseInfo == null) return;
            var win = new WhatsNewWindow(updateService.LatestReleaseInfo, updateService)
            {
                Owner =  MainWindow
            };
            windowManager.Open(WindowKey.WhatsNew, win, true, null, MainWindow);
        }


        public void OpenPlayerDetails(PlayerRenderState player)
        {

            var detailsWindow = new PlayerDetailsWindow
            {
                DataContext = new PlayerDetailsViewModel(
                    sessionManager,
                    player.PlayerId,
                    player.PlayerNameDisplay,
                    player.ClassName,
                    null,
                    player.ClassIcon,
                    settingsService,
                    player.CombatPower,
                    player.ServerName),
                Owner = MainWindow
            };
            windowManager.Open(WindowKey.PlayerDetails, detailsWindow, false, null, MainWindow);
        }


        private void ManageBuffOverlay()
        {
            if (IsBuffOverlayEnabled) OpenBuffOverlay();
            else HideBuffOverlay();
        }
        private void ManageSkillCdOverlay()
        {
            if (IsSkillCdOverlayEnabled) OpenSkillCdOverlay();
            else HideSkillCdOverlay();
        }

        private void OpenBuffOverlay()
        {
            var buffOverlay = new BuffOverlayWindow();
            windowManager.Open(WindowKey.BuffOverlay, buffOverlay, true, persistenceMode: WindowPersistenceMode.OnlyPosition);
        }

        private void HideBuffOverlay()
        {
            windowManager.Hide(WindowKey.BuffOverlay);
        }

        private void OpenSkillCdOverlay()
        {
            var skillCdOverlay = new SkillCdOverlayWindow();
            windowManager.Open(WindowKey.SkillCdOverlay, skillCdOverlay, true, persistenceMode: WindowPersistenceMode.OnlyPosition);
        }

        private void HideSkillCdOverlay()
        {
            windowManager.Hide(WindowKey.SkillCdOverlay);
        }
    }
}
