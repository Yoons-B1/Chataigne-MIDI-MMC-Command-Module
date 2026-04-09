var mmcQueue = [];

function init() {
    script.setUpdateRate(60);
    mmcQueue = [];
    setQueueLength();
    logMMC("init");
}

function moduleParameterChanged(param) {
    if (local.parameters != null && local.parameters.clearQueue != null) {
        if (param.is(local.parameters.clearQueue)) {
            mmcQueue = [];
            setQueueLength();
            logMMC("queue cleared");
        }
    }
}

function update(deltaTime) {
    var i;
    var elapsedMs;

    if (mmcQueue.length <= 0) return;

    elapsedMs = deltaTime * 1000.0;

    for (i = mmcQueue.length - 1; i >= 0; i--) {
        mmcQueue[i].remainingMs = mmcQueue[i].remainingMs - elapsedMs;
        if (mmcQueue[i].remainingMs <= 0) {
            sendMMCCommandAsSysex(mmcQueue[i].commandCode);

            if (mmcQueue[i].forceMMC && mmcQueue[i].commandCode == 1) {
                logMMC("Force MMC: reinforce Stop with SysEx Stop");
                sendMMCCommandAsSysex(1);
            }

            mmcQueue.splice(i, 1);
        }
    }

    setQueueLength();
}

function mmcCommand(commandCode, forceMMC) {
    var code = toInt(commandCode, 1);
    var force = toBool(forceMMC, false);

    logMMC("MMC Command callback: " + getCommandName(code) + " (" + code + ")");

    if (force) {
        logMMC("Force MMC: prepend native MMC Stop");
        sendNativeMMCCommand(1);
    }

    sendMMCCommandAsSysex(code);

    if (force && code == 1) {
        logMMC("Force MMC: reinforce Stop with SysEx Stop");
        sendMMCCommandAsSysex(1);
    }
}

function mmcGoto(hours, minutes, seconds, frames, subframes, repeatGoto) {
    var repeats = normalizeGotoRepeats(repeatGoto, 1);

    logMMC("MMC Goto callback: " + two(hours) + ":" + two(minutes) + ":" + two(seconds) + ":" + two(frames) + " x" + repeats + " @ " + getFrameRateLabel());
    sendRepeatedGotoAsSysex(hours, minutes, seconds, frames, subframes, repeats);
}

function mmcCue(hours, minutes, seconds, frames, subframes, repeatGoto, delayMs, commandCode, forceMMC) {
    var code = toInt(commandCode, 1);
    var force = toBool(forceMMC, false);
    var delay = normalizeDelay(delayMs);
    var repeats = normalizeGotoRepeats(repeatGoto, getDefaultCueGotoRepeats());

    logMMC("MMC Cue callback: " + two(hours) + ":" + two(minutes) + ":" + two(seconds) + ":" + two(frames) + " @ " + getFrameRateLabel() + " -> " + getCommandName(code) + ", repeat=" + repeats + ", delay=" + delay + "ms, force=" + force);

    if (force) {
        logMMC("Force MMC: prepend native MMC Stop");
        sendNativeMMCCommand(1);
    }

    sendRepeatedGotoAsSysex(hours, minutes, seconds, frames, subframes, repeats);

    if (delay <= 0) {
        sendMMCCommandAsSysex(code);

        if (force && code == 1) {
            logMMC("Force MMC: reinforce Stop with SysEx Stop");
            sendMMCCommandAsSysex(1);
        }
    } else {
        mmcQueue.push({
            remainingMs: delay,
            commandCode: code,
            forceMMC: force
        });
        setQueueLength();
        logMMC("queued final SysEx command in " + delay + "ms");
    }
}

function sendNativeMMCCommand(commandCode) {
    var code = toInt(commandCode, 1);

    setLastCommand(getCommandName(code));
    logMMC("Send midi machine control command : " + code);

    if (local.sendMachineControlCommand != null) {
        local.sendMachineControlCommand(code);
        return true;
    }

    if (local.sendMidiMachineControlCommand != null) {
        local.sendMidiMachineControlCommand(code);
        return true;
    }

    logMMC("WARNING: native MMC command function not found, falling back to SysEx");
    sendMMCCommandAsSysex(code);
    return false;
}

function sendRepeatedGotoAsSysex(hours, minutes, seconds, frames, subframes, repeats) {
    var i;
    for (i = 0; i < repeats; i++) {
        sendMMCGotoAsSysex(hours, minutes, seconds, frames, subframes);
    }
}

function sendMMCCommandAsSysex(commandCode) {
    var code = toInt(commandCode, 1);
    var deviceId = getDeviceId();
    var sysex = [240, 127, deviceId, 6, code, 247];

    setLastCommand(getCommandName(code));
    logSysex(sysex);
    sendSysexCompat(sysex);
}

function sendMMCGotoAsSysex(hours, minutes, seconds, frames, subframes) {
    var h = clamp(toInt(hours, 0), 0, 23);
    var m = clamp(toInt(minutes, 0), 0, 59);
    var s = clamp(toInt(seconds, 0), 0, 59);
    var f = clamp(toInt(frames, 0), 0, getMaxFramesForSelectedRate());
    var sf = clamp(toInt(subframes, getDefaultSubframes()), 0, 99);
    var deviceId = getDeviceId();
    var hrByte = (h & 31) + getFrameRateCode();
    var sysex = [240, 127, deviceId, 6, 68, 6, 1, hrByte, m, s, f, sf, 247];
    var gotoText = h + ":" + m + ":" + s + "." + f;

    setLastGoto(gotoText + " @ " + getFrameRateLabel());
    logMMC("Send midi machine control goto : " + gotoText + " @ " + getFrameRateLabel());
    logSysex(sysex);
    sendSysexCompat(sysex);
}

function sendSysexCompat(sysex) {
    if (local.sendSysex != null) {
        local.sendSysex(sysex);
        return;
    }

    if (local.sendBytes != null) {
        local.sendBytes(sysex);
        return;
    }

    if (local.send != null) {
        local.send(sysex);
        return;
    }

    logMMC("ERROR: no MIDI send function found");
}

function logSysex(sysex) {
    var i;

    setLastSysex(sysexToString(sysex));

    if (!shouldLogOutgoing()) return;

    script.log("Send Sysex " + sysex.length + " bytes : ");
    for (i = 0; i < sysex.length; i++) {
        script.log("       " + sysex[i]);
    }
}

function shouldLogOutgoing() {
    if (local.parameters != null && local.parameters.logOutgoing != null) {
        return toBool(local.parameters.logOutgoing.get(), true);
    }
    return true;
}

function getDeviceId() {
    if (local.parameters != null && local.parameters.deviceID != null) {
        return clamp(toInt(local.parameters.deviceID.get(), 127), 0, 127);
    }
    if (local.parameters != null && local.parameters.deviceId != null) {
        return clamp(toInt(local.parameters.deviceId.get(), 127), 0, 127);
    }
    return 127;
}


function getFrameRateMode() {
    if (local.parameters != null && local.parameters.frameRate != null) {
        return toInt(local.parameters.frameRate.get(), 30);
    }
    return 30;
}

function getFrameRateLabel() {
    var mode = getFrameRateMode();
    if (mode == 24) return "24";
    if (mode == 25) return "25";
    if (mode == 2997) return "30DP (29.97)";
    return "30";
}

function getFrameRateCode() {
    var mode = getFrameRateMode();
    if (mode == 24) return 0;
    if (mode == 25) return 32;
    if (mode == 2997) return 64;
    return 96;
}

function getMaxFramesForSelectedRate() {
    var mode = getFrameRateMode();
    if (mode == 24) return 23;
    if (mode == 25) return 24;
    return 29;
}

function getDefaultSubframes() {
    if (local.parameters != null && local.parameters.defaultSubframes != null) {
        return clamp(toInt(local.parameters.defaultSubframes.get(), 0), 0, 99);
    }
    return 0;
}

function getDefaultCueGotoRepeats() {
    if (local.parameters != null && local.parameters.defaultCueGotoRepeats != null) {
        return clamp(toInt(local.parameters.defaultCueGotoRepeats.get(), 2), 1, 4);
    }
    return 2;
}

function normalizeGotoRepeats(v, fallback) {
    return clamp(toInt(v, fallback), 1, 4);
}

function normalizeDelay(v) {
    if (v == null) {
        if (local.parameters != null && local.parameters.defaultCueDelayMs != null) {
            return clamp(toInt(local.parameters.defaultCueDelayMs.get(), 0), 0, 2000);
        }
        return 0;
    }
    return clamp(toInt(v, 0), 0, 2000);
}

function setLastCommand(text) {
    if (local.values != null && local.values.status != null && local.values.status.lastSentCommand != null) {
        local.values.status.lastSentCommand.set(text);
    }
}

function setLastGoto(text) {
    if (local.values != null && local.values.status != null && local.values.status.lastGoto != null) {
        local.values.status.lastGoto.set(text);
    }
}

function setLastSysex(text) {
    if (local.values != null && local.values.status != null && local.values.status.lastSysex != null) {
        local.values.status.lastSysex.set(text);
    }
}

function setQueueLength() {
    if (local.values != null && local.values.status != null && local.values.status.queueLength != null) {
        local.values.status.queueLength.set(mmcQueue.length);
    }
}

function setLastLog(text) {
    if (local.values != null && local.values.status != null && local.values.status.lastLog != null) {
        local.values.status.lastLog.set(text);
    }
}

function logMMC(msg) {
    setLastLog(msg);
    script.log(msg);
}

function sysexToString(sysex) {
    var i;
    var out = "";
    for (i = 0; i < sysex.length; i++) {
        if (i > 0) out += " ";
        out += sysex[i];
    }
    return out;
}

function getCommandName(code) {
    code = toInt(code, 0);
    if (code == 1) return "Stop";
    if (code == 2) return "Play";
    if (code == 3) return "Deferred Play";
    if (code == 4) return "Fast Forward";
    if (code == 5) return "Rewind";
    if (code == 6) return "Record Start";
    if (code == 7) return "Record Stop";
    if (code == 9) return "Pause";
    return "Unknown";
}

function toInt(v, fallback) {
    var n = parseInt(v, 10);
    if (n !== n) return fallback;
    return n;
}

function toBool(v, fallback) {
    if (v === true) return true;
    if (v === false) return false;
    if (v == null) return fallback;
    if (v == 1 || v == "1" || v == "true") return true;
    if (v == 0 || v == "0" || v == "false") return false;
    return fallback;
}

function clamp(v, minV, maxV) {
    if (v < minV) return minV;
    if (v > maxV) return maxV;
    return v;
}

function two(v) {
    var s = "" + toInt(v, 0);
    if (s.length < 2) s = "0" + s;
    return s;
}
