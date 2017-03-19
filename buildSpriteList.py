#!/usr/bin/env python

#arguments are:
# name
# in filename
# out pack filename
# out animation list filename
# name of json object to store data

import sys,os,json
from PIL import Image

sprites = []
animations = {}

with open(sys.argv[1]) as dataFile:
    data = json.load(dataFile)[sys.argv[4]]
    for sprite in data:
        image = Image.open(sprite["url"])
        length = 0

        for animation in sprite["animations"]:
            if animation["frames"][1] > length:
                length = animation["frames"][1]

        sprites.append({"type":"spritesheet","key":sprite["key"],"url":sprite["url"],
                    "frameWidth":image.size[0] / length,"frameHeight":image.size[1]})
        animations[sprite["key"]] = sprite["animations"]

with open(sys.argv[2], 'w') as outfile:
    json.dump({"sprites":sprites}, outfile)

with open(sys.argv[3], 'w') as outfile:
    json.dump({"animations":animations}, outfile)
