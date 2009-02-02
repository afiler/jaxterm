#!/Library/Frameworks/Python.framework/Versions/Current/bin/python
# -*- coding: utf-8 -*-

import cgi
import cgitb; cgitb.enable()
import codecs
import sys
import subprocess
import time
import os
import signal
import tempfile

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
session = 'date'
f = tempfile.NamedTemporaryFile()
p = subprocess.Popen('/usr/bin/screen -S ' + session + ' -X hardcopy '+f.name, shell=True)
p.wait()
print ''.join(f.readlines())
f.close()

