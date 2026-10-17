import os
import sys
import threading
import socket
from http.server import SimpleHTTPRequestHandler, HTTPServer
import webview

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Silenzia i log HTTP standard

def start_server(port, root_dir):
    os.chdir(root_dir)
    server = HTTPServer(('127.0.0.1', port), QuietHandler)
    server.serve_forever()

def main():
    if getattr(sys, 'frozen', False):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    port = find_free_port()
    server_thread = threading.Thread(target=start_server, args=(port, base_dir), daemon=True)
    server_thread.start()

    window = webview.create_window(
        title="Yggdrasill • Journey to Ragnarok (Edizione Ufficiale)",
        url=f"http://127.0.0.1:{port}/index.html",
        width=1366,
        height=850,
        min_size=(1024, 680),
        background_color="#06090e"
    )
    webview.start(debug=False)

if __name__ == "__main__":
    main()
