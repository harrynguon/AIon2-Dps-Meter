using System;
using System.ComponentModel;
using Microsoft.AspNetCore.Components.WebView;
using Microsoft.AspNetCore.Components.WebView.Wpf;
using Serilog;

namespace AionDpsMeter.UI.Services.Windowing
{
    /// <summary>
    /// Reusable template for a chromeless window hosting one BlazorWebView.
    /// Identical shape/behavior to the original hand-written SettingsWindow.xaml —
    /// same init order (InitializeComponent, then RootComponents, then Services) —
    /// just parameterized so you don't need a new .xaml file per Blazor page.
    /// Closing first disposes the hosted Razor components, then the WebView (see OnClosing).
    ///
    /// Usage (replaces `new SettingsWindow { DataContext = settingsViewModel }`):
    ///
    ///   var win = new BlazorWindow(App.AppHost.Services, typeof(SettingsPage))
    ///   {
    ///       Width = 500,
    ///       Height = 900,
    ///       DataContext = settingsViewModel,
    ///   };
    ///   windowManager.Open(WindowKey.Settings, win, isSingleton: true, owner: this);
    ///
    /// Non-Blazor windows (History, PlayerDetails, StatEfficiencyCalculator,
    /// WhatsNew) don't use this at all — they stay their own hand-authored
    /// Window/XAML classes, built the same way you already build them.
    /// </summary>
    public partial class BlazorWindow : System.Windows.Window
    {
        private readonly DeferredWindowClose deferredClose;

        /// <param name="services">Usually App.AppHost.Services.</param>
        /// <param name="componentType">The Razor page/component to render at #app (e.g. typeof(SettingsPage)).</param>
        /// <param name="hostPage">Override if a page needs a different host HTML file. Defaults to "wwwroot/index.html" (set in XAML).</param>
        public BlazorWindow(IServiceProvider services, Type componentType, string? hostPage = null)
        {
            InitializeComponent();

            if (hostPage is not null)
                BlazorWebView.HostPage = hostPage;

            // Exact same order as the working SettingsWindow.xaml.cs:
            // RootComponents added first, then Services assigned.
            BlazorWebView.RootComponents.Add(new RootComponent
            {
                Selector = "#app",
                ComponentType = componentType
            });
            BlazorWebView.Services = services;

            BlazorWebView.BlazorWebViewInitialized += (_, e) =>
                e.WebView.DefaultBackgroundColor = System.Drawing.Color.Transparent;

            deferredClose = new DeferredWindowClose(
                () => BlazorWebView.DisposeAsync(),
                Close,
                ex => Log.Warning(ex, "Blazor content disposal failed; closing {Title} anyway.", Title));
            Closed += (_, _) => deferredClose.MarkClosed();
        }

        /// <summary>
        /// Disposes Razor components before WPF tears down the WebView2 control, so their final
        /// interop messages still reach a live WebView. Closes that cannot be cancelled
        /// (application shutdown) proceed immediately.
        /// </summary>
        protected override void OnClosing(CancelEventArgs e)
        {
            base.OnClosing(e);
            if (!e.Cancel)
                e.Cancel = deferredClose.ShouldCancelClose();
        }
    }
}
