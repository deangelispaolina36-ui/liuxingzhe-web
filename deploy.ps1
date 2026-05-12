param(
  [string]$Message = "Update site",
  [string]$Remote = "https://github.com/deangelispaolina36-ui/liuxingzhe-web.git",
  [string]$DeployDir = ""
)

$ErrorActionPreference = "Stop"

$SourceDir = $PSScriptRoot
if (-not $DeployDir) {
  $DeployDir = Join-Path (Split-Path $SourceDir -Parent) "liuxingzhe-web-deploy"
}

Write-Host "Source: $SourceDir"
Write-Host "Deploy checkout: $DeployDir"

if (-not (Test-Path (Join-Path $DeployDir ".git"))) {
  if (Test-Path $DeployDir) {
    throw "DeployDir exists but is not a git repository: $DeployDir"
  }
  git clone $Remote $DeployDir
}

Copy-Item -LiteralPath (Join-Path $SourceDir "index_new.html") -Destination (Join-Path $SourceDir "index.html") -Force

$Exclude = @(".git", ".gitignore", "deploy.ps1")
Get-ChildItem -LiteralPath $SourceDir -Force | Where-Object {
  $Exclude -notcontains $_.Name
} | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $DeployDir -Recurse -Force
}

Copy-Item -LiteralPath (Join-Path $DeployDir "index_new.html") -Destination (Join-Path $DeployDir "index.html") -Force

git -C $DeployDir status --short

$Changes = git -C $DeployDir status --porcelain
if (-not $Changes) {
  Write-Host "No changes to deploy."
  exit 0
}

git -C $DeployDir add .
git -C $DeployDir commit -m $Message
git -C $DeployDir push

Write-Host "Pushed. EdgeOne Pages should redeploy automatically in about 1-2 minutes."
