# ACT Rotation Hero

This is a free open source tool to practice your rotation inside and outside of FFXIV.

To give this tool a try, head over to https://sargodarya.github.io/act-rotation-hero/ to practice in the browser or use this URL as overlay in ACT to practice directly in game.

Note: When talking about the **full** browser version, just opening the URL in the browser is meant. This is completely free.

## Features

### Rotation hero overlay

* ACT Overlay Support (just include the URL)
* Community rotation presets for each discipile of war
* Customisable rotations with repeatable steps
* (Planned) Different training modes to increase efficiency in learning

### Full browser version

* Massive full version with simulated UI
* Hotbar customisation (1x12, 2x6, 3x4, 4x3, 6x2, 12x1, Scaling, Visibility)
* Drag/Drop of actions
* Persistent hotbars layout and allocation
* Persistent Key bindings
* Rotation Recorder / action history
* (Partial) Support for gamepads
* (Partial) Cross hotbars
* (Planned) Combo indicators
* (Planned) Movement simulator for directionals and dodging practice
* (Evaluating) Drag/Drop of HOTBAR.DAT for automatic hotbar allocation

# Development

The primary development focusses on acting as ACT overlay. The browser version is mainly there to support players who for any
can't run ACT and thus need to practice outside of the game.

This is at the moment a frontend only project running entirely on typescript and written without any framework.

## Usage
Start developing in the **src/** directory. The structure will be preserved and all files and compilations are copied to the output directory **bin/**.

To start a local server and watch the *bin/* directory just call
```
npm start
```

### Scripts
Watching all files
```
npm run watch:*
```

Build all files
```
npm build
```

Run a local server
```
npm run serve
```

# License

This project is licensed under MIT.

# Disclaimer

Square Enix, Final Fantasy, Final Fantasy XIV, Final Fantasy XIV: Heavensward, Final Fantasy XIV: Stormblood, and all associated logos and designs are trademarks or registered trademarks of Square Enix Holdings Co., Ltd.
