import json
import os

# room key explinations:
"""
name: the human readable name of the room
desc.long: the long decription, read when first entering the room
desc.short: a short description of the room
introtext: a list of texts, the first true one will print out to the screen
store: a list of items, all of the true items will be visible in the store
container: a chest of sorts
stable: the description of the stable
do: a list of do strings with conditionals attacked
"""

#with open("assets/world.json", "r") as file:
#  world = json.parse(file.read())

print("reading world")

with open("assets/teaserworld.json", "r") as file:
  world = json.loads(file.read())

print("reading items")

with open("assets/items.json", "r") as file:
  items = json.loads(file.read())

print("reading npcs")

with open("assets/npcs.json", "r") as file:
  npcs = json.loads(file.read())

print("reading quests")

with open("assets/quests.json", "r") as file:
  quests = json.loads(file.read())

print("reading containers")

with open("assets/containers.json", "r") as file:
  containers = json.loads(file.read())

maind = {
  "items" : items,
  "npcs" : npcs,
  "world" : world,
  "quests" : quests,
  "containers" : containers
}

print("encoding")

text = json.dumps(maind).encode("utf-8")

print("total length: " + str(round(len(text)/1024, 2)) + "kb")

import lzma
with lzma.open("hurricane/data/assets.dat", "w") as f:
  f.write(text)

file_size = os.stat("hurricane/data/assets.dat").st_size/1024

print("file length:  " + str(round(file_size, 2)) + "kb")


#htf.encode(json.dumps(maind), KEY, "hurricane/data/assets.dat")

print("done")