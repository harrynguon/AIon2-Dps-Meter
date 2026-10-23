# Development

Requires Windows, .NET 10 SDK, Node 22+, installed Microsoft Edge for browser checks, and WebView2. Normal capture also needs upstream Npcap prerequisites. Standalone companion does not start capture.

PowerShell setup uses an explicit checkout path and resolves tools. Stop on any failed command.

```powershell
$checkoutPath = Read-Host 'Absolute checkout path'
if (-not [IO.Path]::IsPathFullyQualified($checkoutPath)) { throw 'Absolute path required.' }
$repoRoot = (Resolve-Path -LiteralPath $checkoutPath -ErrorAction Stop).Path
$dotnetExe = (Get-Command dotnet -ErrorAction Stop).Source
$npmExe = (Get-Command npm.cmd -ErrorAction Stop).Source
$solutionPath = Join-Path $repoRoot 'AionDpsMeter.slnx'
$projectPath = Join-Path $repoRoot 'AionDpsMeter.UI\AionDpsMeter.UI.csproj'
$lifecyclePath = Join-Path $repoRoot 'AionDpsMeter.LifecycleCheck\AionDpsMeter.LifecycleCheck.csproj'
$publishPath = Join-Path $repoRoot 'local-build'
& $dotnetExe restore $solutionPath '-warnaserror:NU1901,NU1902,NU1903,NU1904'
if ($LASTEXITCODE) { throw 'Restore failed.' }
# Anchor global.json discovery: it selects Microsoft.Testing.Platform.
Push-Location -LiteralPath $repoRoot
try {
    & $dotnetExe test --solution $solutionPath --no-restore
    if ($LASTEXITCODE) { throw '.NET tests failed.' }
} finally { Pop-Location }
& $npmExe --prefix $repoRoot ci --ignore-scripts
if ($LASTEXITCODE) { throw 'npm install failed.' }
& $npmExe --prefix $repoRoot test
if ($LASTEXITCODE) { throw 'JS tests failed.' }
& $npmExe --prefix $repoRoot run test:browser
if ($LASTEXITCODE) { throw 'Browser tests failed.' }
& $dotnetExe build $solutionPath --no-restore
if ($LASTEXITCODE) { throw 'Build failed.' }
& $dotnetExe run --project $lifecyclePath --no-build
if ($LASTEXITCODE) { throw 'Window lifecycle check failed.' }
& $dotnetExe list $solutionPath package --vulnerable --include-transitive --no-restore
```

Edge checks use a synthetic bridge and generate ignored .artifacts output. They do not replace native host or combat checks. CI runs .NET, JS, browser, build and native window lifecycle checks on Windows.

## Publish

Use the same variables. The UI project invokes dotnet to publish the updater; place the chosen SDK on PATH.

```powershell
$env:PATH = "$(Split-Path -Parent $dotnetExe);$env:PATH"
& $dotnetExe publish $projectPath -c Release -r win-x64 --self-contained true `
    -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o $publishPath
if ($LASTEXITCODE) { throw 'Publish failed.' }
$appPath = Join-Path $publishPath 'AionDpsMeter.UI.exe'
& $appPath --world-companion
# After closing standalone mode, normal launch:
# & $appPath
```

Retain the entire published folder, including wwwroot. local-build is ignored. The published-executable smoke check (companion-only open, render, close) is manual; see HANDOFF.md. Do not add production remote-debugging flags for testing.

## Native window lifecycle check

AionDpsMeter.LifecycleCheck guards the companion close crash fixed in b4740c5. Companion-only mode exits when its window closes, which hides crashes raised on the UI dispatcher during close, so the check hosts the real BlazorWindow and WorldCompanion in a WPF application that keeps running, as the integrated meter does. Each companion opens off-screen without taking focus or a taskbar button. The first two close with the companion's ✕ button, the third with WM_CLOSE (what Alt+F4 sends), and the fourth is still open when the application shuts down. The host keeps running for two seconds after each close, because a failed Blazor send surfaces on a later dispatcher turn.

Run it after building, as in the setup block above (`dotnet run --project $lifecyclePath --no-build`); a run takes about 15 seconds. It prints one line per step. Exit codes:

- 0: PASS.
- 1: an unhandled exception escaped the application (the stack is printed; the meter would have crashed), or a step failed or did not finish within 30 seconds.
- 2: no result within three minutes (hung UI thread).

A crash on another thread ends the process with the runtime's own nonzero code. Treat any nonzero exit as a failure.

With DeferredWindowClose.ShouldCancelClose forced to return false, it fails at the first close with the reported InvalidOperationException from Blazor IpcSender.

The check never creates packet capture or the meter's own windows. A new temporary directory holds the companion store (registered with AddCompanionStore) and the WebView2 profile (WEBVIEW2_USER_DATA_FOLDER, set only inside the check process). Player settings are never read or written. The directory is removed after a passing run. If a failure leaves a companion open, WebView2 keeps its profile and the check prints the leftover path (synthetic data only, safe to delete); a watchdog exit skips cleanup. The page is driven through CoreWebView2 script execution, so no remote-debugging port is opened. Web assets come from the UI's development static web assets manifest, which the check's build copies as its own, so it serves this checkout's wwwroot and blazor.webview.js. It does not cover the integrated meter, capture, combat or the ◈ button.
