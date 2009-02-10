#!/Library/Frameworks/Python.framework/Versions/Current/bin/python
# -*- coding: utf-8 -*-

#import pty
#import os
#
#(pid, master_fd) = pty.fork()
#
#if pid == pty.CHILD:
#    os.execvp("screen", [ "-x" ])
#else:
#    print os.read(master_fd, 80)
#    print os.read(master_fd, 80)
#    print os.read(master_fd, 80)


import cgi
#import cgitb; cgitb.enable()
import codecs
import sys
import subprocess
import time
import os
import signal
import tempfile
import pty
import select

sys.stderr = sys.stdout
sys.stdout=codecs.getwriter('utf-8')(sys.stdout)

#sudo chmod a+rw /dev/ttys000
#andyf@plum:~$ sudo -u _www screen -S date bash -c 'while(true); do date; sleep 3; done'

print "Content-Type: text/plain"
print
#print screen
#fifo = open("fifo","r")

#while True:
#print fifo.readline()[:-1]
#p = subprocess.Popen('/usr/bin/screen -r -S date', shell=True, stdout=sys.stdout)
#time.sleep(1)
#os.kill(p.pid, signal.SIGHUP)

def foo():
  session = 'date'
  f = tempfile.NamedTemporaryFile()
  p = subprocess.Popen('/usr/bin/screen -S ' + session + ' -X hardcopy '+f.name, shell=True)
  p.wait()
  print ''.join(f.readlines())
  f.close()

(pid, master_fd) = pty.fork()

if pid == pty.CHILD:
  os.environ['TERM'] = 'xterm-color'
  os.execvp("screen", [ "-rd" ])
  #os.execvp("top", ["-o cpu"])
else:
  while True:
    r,w,x = select.select([master_fd], [], [])
    print os.read(r[0], 1024),
    sys.stdout.flush()
