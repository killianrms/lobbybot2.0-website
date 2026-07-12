$action = New-ScheduledTaskAction -Execute 'C:\Users\Aeroz\Desktop\dev\bot\lobbybot2.0-website\start.bat'
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'Aeroz' -LogonType S4U -RunLevel Highest
Register-ScheduledTask -TaskName 'LobbyBot Dashboard' -Action $action -Trigger $trigger -Principal $principal -Description 'Auto-starts LobbyBot Dashboard on boot with auto-restart' -Force
