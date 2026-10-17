import os
import sys
import threading
import socket
import subprocess
import shutil
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Silenzia i log HTTP standard in console

def start_server(port, root_dir):
    os.chdir(root_dir)
    server = HTTPServer(('127.0.0.1', port), QuietHandler)
    server.serve_forever()

def find_browser_executable():
    """Trova un browser Chromium-based compatibile con la modalità --app (Edge o Chrome)"""
    # 1. Percorsi standard Microsoft Edge (incluso in ogni Windows 10/11)
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        shutil.which("msedge.exe") or "",
        shutil.which("msedge") or ""
    ]
    for p in edge_paths:
        if p and os.path.isfile(p):
            return p

    # 2. Percorsi standard Google Chrome
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        shutil.which("chrome.exe") or "",
        shutil.which("chrome") or ""
    ]
    for p in chrome_paths:
        if p and os.path.isfile(p):
            return p

    return None

def main():
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    port = find_free_port()
    server_thread = threading.Thread(target=start_server, args=(port, base_dir), daemon=True)
    server_thread.start()

    app_url = f"http://127.0.0.1:{port}/index.html"
    browser_exe = find_browser_executable()

    if browser_exe:
        # Profilo isolato per Yggdrasill (evita conflitti con estensioni personali e garantisce alte performance WebGL)
        user_data_dir = os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")), "Yggdrasill_App_Profile")
        os.makedirs(user_data_dir, exist_ok=True)

        cmd = [
            browser_exe,
            f"--app={app_url}",
            f"--user-data-dir={user_data_dir}",
            "--window-size=1366,850",
            "--window-position=center",
            "--disable-features=Translate",
            "--no-first-run",
            "--no-default-browser-check"
        ]
        try:
            proc = subprocess.Popen(cmd)
            proc.wait()
            return
        except Exception:
            pass

    # Fallback universale se il processo app non dovesse partire
    webbrowser.open(app_url)

if __name__ == "__main__":
    main()
