param(
  [switch]$SkipSeed
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$admin = Join-Path $root 'admin'
$mongoPort = 27018
$mongoData = Join-Path $root '.local-mongo-rs'
$mongoLog = Join-Path $mongoData 'mongod.log'
$mongoExe = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe'

function Test-Port($port) {
  return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

if (-not (Test-Port $mongoPort)) {
  New-Item -ItemType Directory -Force -Path $mongoData | Out-Null
  Start-Process -FilePath $mongoExe -ArgumentList @('--replSet','rs0','--port',$mongoPort,'--bind_ip','127.0.0.1','--dbpath',$mongoData,'--logpath',$mongoLog) -WindowStyle Hidden | Out-Null
  $deadline = (Get-Date).AddSeconds(30)
  while (-not (Test-Port $mongoPort) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 500 }
  if (-not (Test-Port $mongoPort)) { throw "MongoDB không mở được cổng $mongoPort. Xem $mongoLog" }
}

Push-Location $admin
try {
  $initScript = "const { MongoClient } = require('mongodb'); (async()=>{const c=new MongoClient('mongodb://127.0.0.1:$mongoPort/?directConnection=true'); await c.connect(); try { await c.db('admin').command({replSetInitiate:{_id:'rs0',members:[{_id:0,host:'127.0.0.1:$mongoPort'}]}}); } catch(e) { if(e.codeName !== 'AlreadyInitialized') throw e; } await c.close();})().catch(e=>{console.error(e);process.exit(1)})"
  node -e $initScript

  $state = ''
  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) {
    try {
      $state = node -e "const { MongoClient } = require('mongodb'); (async()=>{const c=new MongoClient('mongodb://127.0.0.1:$mongoPort/?replicaSet=rs0'); await c.connect(); const s=await c.db('admin').command({replSetGetStatus:1}); console.log(s.myState); await c.close()})().catch(()=>process.exit(1))"
      if ($state.Trim() -eq '1') { break }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  if ($state.Trim() -ne '1') { throw 'MongoDB replica set chưa chuyển sang primary.' }
} finally {
  Pop-Location
}

if (-not $SkipSeed) {
  $env:SEED_LOCAL = 'true'
  $env:SEED_ADMIN_PASSWORD = 'DemoAdmin123!'
  Push-Location $admin
  try { npm run seed:local } finally { Pop-Location }
}

if (-not (Test-Port 3001)) {
  Start-Process -FilePath npm.cmd -ArgumentList 'run dev' -WorkingDirectory $admin -WindowStyle Hidden -RedirectStandardOutput (Join-Path $admin 'admin-dev.log') -RedirectStandardError (Join-Path $admin 'admin-dev-error.log') | Out-Null
}
if (-not (Test-Port 3000)) {
  Start-Process -FilePath node.exe -ArgumentList '.\node_modules\next\dist\bin\next','dev' -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'storefront-dev.log') -RedirectStandardError (Join-Path $root 'storefront-dev-error.log') | Out-Null
}

Write-Host 'Storefront: http://localhost:3000' -ForegroundColor Green
Write-Host 'Admin:      http://localhost:3001/admin' -ForegroundColor Green
Write-Host 'Admin demo: admin@local.test / DemoAdmin123!' -ForegroundColor Yellow
