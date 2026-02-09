import subprocess
import threading
import time
import re
import os
import json

def run_tunnel(port):
    if not os.path.exists("cloudflared.exe"):
        print("❌ ERROR: cloudflared.exe not found. Copying it now...")
        return

    # Khởi động tunnel cho port 3010
    cmd = ["./cloudflared.exe", "tunnel", "--url", f"http://localhost:{port}"]
    
    try:
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True, 
            bufsize=1,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0,
            encoding='utf-8', 
            errors='replace'
        )
        
        print(f"🚀 Starting Cloudflare Tunnel for Port {port}...")
        
        for line in process.stdout:
            # Tìm link trycloudflare trong log
            if "trycloudflare.com" in line and ".tgz" not in line:
                match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line)
                if match:
                    url = match.group(0)
                    print("\n" + "="*50)
                    print(f"✅ GIA PHẢ SỐ ONLINE AT: {url}")
                    print("="*50 + "\n")
                    
                    # Lưu vào file để tiện tra cứu
                    with open("online_url.txt", "w") as f:
                        f.write(url)
                        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Đổi port thành 3010 theo yêu cầu mới của bạn
    run_tunnel(3010)
