#!/usr/bin/env python

import sys

data = "{\""+sys.argv[2]+"\":["
for i in range(3,len(sys.argv)):
    data += "{\"type\":\"text\",\"key\":\""+sys.argv[i]+"\",\"url\":\""+sys.argv[i]+"\"}"
    if i != len(sys.argv) - 1:
        data += ","
data += "]}"
fo = open(sys.argv[1], "w")
fo.write(data)
fo.close()
