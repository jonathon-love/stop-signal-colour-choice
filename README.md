# stop-signal-colour-choice

An implementation of the stop-signal task with a colour choice primary task.

This experimental task is composed of two parts, the client responsible for displaying the actual experiment, and the server, responsible for serving up the data files for each participant, and for saving these data files back to the server.

## client

The client is all HTML and JS, and is contained in the `www/` directory of this repo. at present, the client rejects web-browsers that aren't mozilla firefox, or google chrome.

this experiment is typically run in two phases, the go task, and the stop task. these correspond to the files:

  - www/index.html - [demo](https://psyc.thon.love/ss/)
  - www/stop.html - [demo](https://psyc.thon.love/ss/stop.html)

these present the user with a login screen, where they provide their "SONA ID", but these files can be edited to provide a more organizationally appropriate user id.

## data files

data files are JSON, and live inside `www/data/data`, which is [browseable](https://psyc.thon.love/ss/data/data/).

code to generate data files:

 - [go gist](https://gist.github.com/jonathon-love/a25166c2925d840e57fa)
 - [stop gist](https://gist.github.com/jonathon-love/5de3403fbc812fc6b0d3bd7d7c8ef228)

data files are assigned to participants based on their username. data files should be called `go-<username>.json` and `stop-<username>.json`, for the go and stop sessions respectively. for example, if you were running a participant who's username/login/SONA ID was fred, you would need to provide the files:

 - go-fred.json
 - stop-fred.json

data file names, and user names should not contain spaces.

as the experiment proceeds, the data is filled in (RTs, response, SSD, etc.) before being written to the server.

## server

the server is written in PHP, and the server needs to support that (they pretty much all do). server code lives in `www/data`.


## customization

### instructions

as can be seen in the data files, there is a `viewInstructions` task, which takes the path to some HTML content. these currently point to instructions files in `www/resources/`. these can be edited, and customised to taste. to provide different instructions to different participants, you would create two sets of instructions (as HTML) in `www/resources`, and then provide paths to either one set of instructions, or the other, in the generated data files.

i.e. in the JSON file for particpants assigned to group 1 you might have:

    {
        "type": "viewInstructions",
        "instructions": [
            "resources/instr-go-manip-1.html",
            "resources/instr-go-manip-2.html",
            "resources/instr-go-manip-3.html",
            "resources/instr-go-manip-4.html"
        ]
    },

for group 2 you might have:

    {
        "type": "viewInstructions",
        "instructions": [
            "resources/instr-go-control-1.html",
            "resources/instr-go-control-2.html",
            "resources/instr-go-control-3.html",
            "resources/instr-go-control-4.html"
        ]
    },



### stimulus presentation

Timing of stimulus presentation, inter-trial intervals, etc. can be customized in (note that these values can be overwritten by values in the data file):

  - www/js/go-task.js
  - www/js/stop-task.js

The display itself (size, frames per second, etc.) can be customized by editing:

 - www/js/colour-chooser.js
