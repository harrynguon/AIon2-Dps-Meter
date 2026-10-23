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
& $dotnetExe list $solutionPath package --vulnerable --include-transitive --no-restore
```

Edge checks use a synthetic bridge and generate ignored .artifacts output. They do not replace native host or combat checks. CI runs .NET, JS, browser and build checks on Windows.

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

Retain the entire published folder, including wwwroot. local-build is ignored. Previous native smoke automation was temporary and is not checked in; reproduce checks using HANDOFF.md. Do not add production remote-debugging flags for testing.

## Native window lifecycle check

Companion-only mode exits when its window closes, which hides crashes raised on the UI dispatcher during close. To exercise close/reopen without packet capture, use a temporary harness outside the repository: a WPF console app referencing AionDpsMeter.UI that keeps running with ShutdownMode.OnExplicitShutdown and opens BlazorWindow with WorldCompanion off-screen. Drive the companion close button through WebView2 DevTools, enabled only for that process by setting WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS to --remote-debugging-port=<port> and WEBVIEW2_USER_DATA_FOLDER to an absolute scratch directory. A harness built with the plain Microsoft.NET.Sdk must copy wwwroot/_framework from a published build, and Playwright must reconnect over CDP for each new companion. A pass is: no unhandled exception, the process stays alive after each close, and exit code 0 after shutdown with a companion open. The harness reads the real companion settings file; opening and closing alone never write it.
