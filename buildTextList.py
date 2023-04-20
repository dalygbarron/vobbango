#!/usr/bin/env python3

import sys,os

data = "{\""+sys.argv[2]+"\":["
for i in range(3,len(sys.argv)):
    data += "{\"type\":\"text\",\"key\":\""+os.path.split(sys.argv[i])[1]+"\",\"url\":\""+sys.argv[i]+"\"}"
    if i != len(sys.argv) - 1:
        data += ","
data += "]}"
fo = open(sys.argv[1], "w")
fo.write(data)
fo.close()
