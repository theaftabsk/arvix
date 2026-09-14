$ErrorActionPreference = "SilentlyContinue"

Write-Host "=================================================="
Write-Host "ARVIX Clean Python Setup and PATH Fixer"
Write-Host "=================================================="

$possiblePaths = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312",
    "C:\Program Files\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python312-32",
    "C:\Python312",
    "$env:LOCALAPPDATA\Programs\Python\Python311",
    "C:\Program Files\Python311"
)

$foundPath = $null
foreach ($p in $possiblePaths) {
    if (Test-Path "$p\python.exe") {
        $foundPath = $p
        break
    }
}

if (-not $foundPath) {
    $search = Get-ChildItem -Path "$env:LOCALAPPDATA\Programs\Python*", "C:\Program Files\Python*" -Filter "python.exe" -Recurse -Depth 2 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($search) {
        $foundPath = $search.DirectoryName
    }
}

if ($foundPath) {
    Write-Host "[OK] Found clean Python at: $foundPath" -ForegroundColor Green
    
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $newAdditions = $foundPath + ";" + $foundPath + "\Scripts"
    
    if ($userPath -notlike "*$foundPath*") {
        $cleanUserPath = $newAdditions + ";" + $userPath
        [Environment]::SetEnvironmentVariable("Path", $cleanUserPath, "User")
        Write-Host "[OK] Added Python to Windows User PATH permanently!" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Python is already in User PATH." -ForegroundColor DarkGray
    }

    $env:Path = $foundPath + ";" + $foundPath + "\Scripts;" + $env:Path
    
    Write-Host ""
    Write-Host "Testing Python in current environment:" -ForegroundColor Cyan
    & "$foundPath\python.exe" --version
    & "$foundPath\python.exe" -m pip --version

    Write-Host ""
    Write-Host "Python is 100 percent configured and ready!" -ForegroundColor Green
    Write-Host "You can now run: python run_backend.py" -ForegroundColor Yellow
} else {
    Write-Host "[ERROR] Python 3.12 executable was not found." -ForegroundColor Red
    Write-Host "Running winget installation..." -ForegroundColor Yellow
    winget install Python.Python.3.12 --silent --override "/passive InstallAllUsers=0 PrependPath=1 Include_pip=1"
}
Write-Host "=================================================="
