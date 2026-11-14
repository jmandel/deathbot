# Demo recording

Tools for recording a scripted session of the web app on an Android emulator: a simulated patient (Frank, 74, COPD; see `eval/personas/copd-frank.md`) talks to the published site, partly by typing and partly by voice.

## Setup

- Emulator `deathbot_demo` (Pixel 8 profile, `android-37.0;google_apis_playstore`). Start it with its audio output going to a virtual PulseAudio sink: `PULSE_SINK=demo_mic PULSE_SOURCE=demo_mic_src emulator -avd deathbot_demo -allow-host-audio -gpu swiftshader_indirect`. Media volume to maximum, `settings put system show_touches 1`.
- Open the site in Chrome with a share link (`#k=…`), then `adb forward tcp:9471 localabstract:chrome_devtools_remote`. Port 9333 belongs to the desktop Chrome on this machine; do not use it.
- `bun drive.ts install-shim` in the background. It must stay running: the dictation stand-in is registered only while its DevTools session is open.

## Speech

The emulator's microphone input garbles audio into clicks, whatever is fed into it, and Google speech recognition does not work on the image without a signed-in Google account. So spoken turns work like this. The patient's line is synthesised with `gemini-api tts --voice Algenib`. `drive.ts speak` turns the app's microphone on and plays the clip through the phone, so it is on the recording's soundtrack. It then transcribes that clip with Gemini, and `dictation-shim.js` delivers the words through the same events the browser's recognizer would. The app's own dictation code handles them from there.

## Recording and editing

1. `scrcpy --no-window --no-control --record=session.mkv --audio-source=output --max-fps=30`; write `<ms> rec-start` and `<ms> cut-start` to `marks.log`.
2. Each on-screen sequence goes through `act.sh`, which closes the cut at the start and opens it at the end. Composing the next turn, synthesising and transcribing speech all fall inside cuts. After a botched sequence, append `<ms> drop-previous`.
3. Stop scrcpy with SIGTERM (SIGINT did not finish the file), then run `ffmpeg -i session.mkv -c copy session-fixed.mkv`.
4. Convert to constant frame rate: `ffmpeg -i session-fixed.mkv -vf fps=30,scale=720:-2,tpad=stop_mode=clone:stop_duration=20 -c:a copy -shortest session-cfr.mkv`. scrcpy writes frames only when the screen changes, and trimming the raw file desynchronises the audio; the padding covers a static screen at the very end, where no frames were written.
5. `python3 detect_busy.py WORKDIR` finds the waits for replies from the Send/Stop button colour and writes `busy.json`. Then run `python3 edit.py WORKDIR --offset 19.9 --drop N`. The offset lines `marks.log` up with the video. Measure it again each session by matching the spoken turns' onsets in the soundtrack to the `speak` times.

## Lessons from the first pass

- Do not tap screen coordinates while the keyboard is up: the taps land on keys. Attach files before typing.
- With the keyboard up, Chrome pans the page. `drive.ts` corrects for `visualViewport.offsetTop`.
- In `act.sh` steps, quote CSS selectors that start with `#`.
- Set the model before recording. The default model returned repeated 502s mid-session ("upstream returned an invalid response").
