namespace AionDpsMeter.Companion;

/// <summary>
/// Window operations the hosting application provides to the companion page. The module never references a
/// host's window manager, so any BlazorWebView host can supply these.
/// </summary>
public interface ICompanionWindow
{
    /// <summary>Starts a native drag of the companion window (the page's Move button).</summary>
    void Drag();

    /// <summary>
    /// Requests that the companion window close. It is called from a JS interop call, so the host must not
    /// destroy the WebView before that call has replied (the meter's BlazorWindow defers teardown for this).
    /// </summary>
    void Close();
}
