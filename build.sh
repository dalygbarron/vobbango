#!/bin/bash

#build it
tsc

#now build the scripts
cd scripts
for file in *.js
do
  rm -rf ../release/scripts/$file
  cp $file $file.c
  gcc $file.c -P -E >> ../release/scripts/$file #$file.max.js
  #uglifyjs# -o ../release/scripts/$file $file.max.js
  rm $file.c #$file.max.js
done

#build the list
cd ../release
../buildTextList.py scriptPack.json scripts scripts/*
cd ..

#get that damn minifier working again mate
