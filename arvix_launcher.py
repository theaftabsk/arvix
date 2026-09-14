import sys
import os
import time
import subprocess
import urllib.request
import webbrowser
import shutil

# Correctly determine BASE_DIR whether running as .py or PyInstaller compiled .exe
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(os.path.abspath(sys.executable))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# If running from dist/ folder, step back one level if needed
if os.path.basename(BASE_DIR).lower() == 'dist':
    parent = os.path.dirname(BASE_DIR)
    if os.path.isdir(os.path.join(parent, "backend")):
        BASE_DIR = parent

BACKEND_DIR = os.path.join(BASE_DIR, "backend")

# Fallback check
if not os.path.isdir(BACKEND_DIR):
    cwd_backend = os.path.join(os.getcwd(), "backend")
    if os.path.isdir(cwd_backend):
        BACKEND_DIR = cwd_backend
    else:
        default_arvix = os.path.join(os.path.expandvars(r"%USERPROFILE%\Downloads\ARVIX"), "backend")
        if os.path.isdir(default_arvix):
            BACKEND_DIR = default_arvix

def is_backend_alive():
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req, timeout=1.2) as resp:
            return resp.status == 200
    except Exception:
        return False

def get_python_exe():
    # 1. Standard Python 3.12 path on Windows
    local_py = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Python", "Python312", "python.exe")
    if os.path.isfile(local_py):
        return local_py

    # 2. System PATH python
    found = shutil.which("python")
    if found and not found.lower().endswith("arvix.exe"):
        return found

    # 3. Non-frozen sys.executable
    if not getattr(sys, 'frozen', False):
        return sys.executable

    return "python"

def start_backend():
    if is_backend_alive():
        print("[ARVIX Launcher] Backend already running on port 8000.")
        return None

    if not os.path.isdir(BACKEND_DIR):
        print(f"[ARVIX Launcher] Warning: BACKEND_DIR not found: {BACKEND_DIR}")
        return None

    entry_script = "run_backend.py"
    if not os.path.isfile(os.path.join(BACKEND_DIR, entry_script)):
        entry_script = "run.py"

    py_exe = get_python_exe()
    print(f"[ARVIX Launcher] Launching Backend using {py_exe} in {BACKEND_DIR}...")

    startupinfo = None
    creationflags = 0
    if sys.platform == "win32":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        creationflags = subprocess.CREATE_NO_WINDOW

    try:
        proc = subprocess.Popen(
            [py_exe, entry_script],
            cwd=BACKEND_DIR,
            startupinfo=startupinfo,
            creationflags=creationflags
        )
        return proc
    except Exception as e:
        print(f"[ARVIX Launcher] Error launching backend process: {e}")
        return None

def launch_app_window():
    url = "http://localhost:8000"
    
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
    ]
    chrome_paths = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]

    browser_bin = None
    for p in edge_paths + chrome_paths:
        if os.path.isfile(p):
            browser_bin = p
            break

    user_data = os.path.expandvars(r"%LOCALAPPDATA%\ARVIX_Desktop")
    if browser_bin:
        cmd = [
            browser_bin,
            f"--app={url}",
            "--window-size=1440,900",
            f"--user-data-dir={user_data}"
        ]
        return subprocess.Popen(cmd)
    else:
        webbrowser.open(url)
        return None

def main():
    backend_proc = start_backend()
    
    # Wait up to 12 seconds for backend to come online
    for _ in range(24):
        if is_backend_alive():
            print("[ARVIX Launcher] Backend online.")
            break
        time.sleep(0.5)

    app_proc = launch_app_window()

    if app_proc:
        app_proc.wait()
        if backend_proc:
            try:
                backend_proc.terminate()
            except Exception:
                pass

if __name__ == "__main__":
    main()
