$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process -WindowStyle Hidden -FilePath "npx.cmd" -ArgumentList "next dev -p 3000" -WorkingDirectory $projectDir
Write-Output "Server starting on http://localhost:3000"
