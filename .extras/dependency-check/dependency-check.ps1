# https://docs.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands?view=powershell-7

# Aufruf:   .\dependency-check.ps1
# ggf. vorher:  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# oder:         Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

Set-StrictMode -Version Latest

$versionMinimum = [Version]'7.5.0'
$versionCurrent = $PSVersionTable.PSVersion
if ($versionMinimum -gt $versionCurrent) {
  throw "PowerShell $versionMinimum statt $versionCurrent erforderlich"
}

# Titel setzen
$host.ui.RawUI.WindowTitle = 'dependency-check'

$nvdApiKey = '12345678-1234-1234-1234-123456789012'
$project = 'buch'

C:\Zimmermann\dependency-check\bin\dependency-check.bat `
  --nvdApiKey $nvdApiKey `
  --project $project `
  --scan ..\.. `
  --suppression suppression.xml `
  --out . `
  --data C:\Zimmermann\dependency-check-data `
  --disableAssembly `
  --disableAutoconf `
  --disableBundleAudit `
  --disableCentral `
  --disableCmake `
  --disableCocoapodsAnalyzer `
  --disableComposer `
  --disableCpan `
  --disableDart `
  --disableGolangDep `
  --disableGolangMod `
  --disableJar `
  --disableMavenInstall `
  --disableMSBuild `
  --disableNugetconf `
  --disableNuspec `
  --disablePip `
  --disablePipfile `
  --disablePnpmAudit `
  --disablePoetry `
  --disablePyDist `
  --disablePyPkg `
  --disableRubygems `
  --disableSwiftPackageManagerAnalyzer `
  --disableYarnAudit
