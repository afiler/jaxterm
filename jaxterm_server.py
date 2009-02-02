import time
import BaseHTTPServer

HOST_NAME = 'localhost'
PORT_NUMBER = 8091

screen = """┌───────────────┤telseth (andyfiler@hotmail.com -- MSN)├───────────────┐
│                                                                      │
│                                                                     ▒│
│                                                                     ▒│
│                                                                     ▒│
│                                                                     ▒│
│                                                                     ▒│
│(14:16:26) telseth: hey whats up?                                    ▒│
│(14:16:51) AndyF: just installed finch (text IM client ') )          ▒│
│(14:17:26) telseth: whee!!                                           ▒│
│(14:18:10) AndyF: so now it lives on my shell account, and so I'll   ▒│
│always have an IM client up somewhere                                ▒│
│(14:18:22) telseth: Resource: Adium732CB5C0 (10)                     ▒│
│Status: Away                                                         ▒│
│Away                                                                 ▒│
│Resource: HomeA3FA46E3 (1)                                           ▒│
│(14:18:54) telseth: whoa                                             ▒│
│(14:18:59) telseth: this thing looks funny                           ▒│
│(14:19:14) AndyF: if I get IMs at home, then I can't look at them    ▒│
│from somewhere else unless I want to VNC into a 3300x1080 display    ▒│
│(14:19:41) telseth: i have my vnc set up to 1280x1024                 │
│______________________________________________________________________│
└──────────────────────────────────────────────────────────────────────┘
"""

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_HEAD(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()
    def do_GET(s):
        """Respond to a GET request."""
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()
        #s.wfile.write("<p>You accessed path: %s</p>" % s.path)
        s.wfile.write(screen)
        
if __name__ == '__main__':
    server_class = BaseHTTPServer.HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print time.asctime(), "Server Starts - %s:%s" % (HOST_NAME, PORT_NUMBER)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print time.asctime(), "Server Stops - %s:%s" % (HOST_NAME, PORT_NUMBER)
