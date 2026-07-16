Start-Process -WindowStyle Hidden -FilePath "npx.cmd" -ArgumentList "next dev -p 3000" -WorkingDirectory "C:\Users\usari\Documents\barber-web"
Write-Output "Server starting on http://localhost:3000"
