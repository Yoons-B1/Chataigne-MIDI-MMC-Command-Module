[![Module](https://img.shields.io/badge/Module-for%20Chataigne-ffa200)](https://benjamin.kuperberg.fr/chataigne/en) [![Platform](https://img.shields.io/badge/platform-MacOS%20%7C%20Windows%20%7C%20Linux-6d9fba)](https://github.com/Yoons-B1/Chataigne-MIDI-MMC-Command-Module/releases) [![Release](https://img.shields.io/badge/Release-V.1.1-fc1ba6)](https://github.com/Yoons-B1/Chataigne-MIDI-MMC-Command-Module/releases) [![License](https://img.shields.io/github/license/Yoons-B1/ModbusTCP-polling_Chataigne-Module)](https://github.com/Yoons-B1/ModbusTCP-polling_Chataigne-Module/blob/main/LICENSE)
# Chataigne - MIDI MMC Command(SysEx) - Module  

## 1. Overview

This module is designed to control timecode-based playback devices using **MIDI Machine Control (MMC) via SysEx**.

It is optimized for devices like the **DOREMIDI MTC-30**, where standard MMC commands may not work reliably, and SysEx-based control is required for stable operation.

---
<img width="614" height="895" alt="modulemane01" src="https://github.com/user-attachments/assets/4654906b-d478-4451-9e3b-fbcd4393c790" />

## 2. Key Features

* Send **MMC Command (SysEx)** such as Play, Stop, etc.
* Send **MMC Goto (SysEx)** using timecode (HH:MM:SS:FF)
* Create **MMC Cue (Goto + Command)** sequences with optional delay
* Built-in **Force MMC** option for improved device stability
* Supports **Frame Rate selection**

  * 24 fps
  * 25 fps
  * 30DP (29.97fps)
  * 30 fps

<img width="500" height="423" alt="forcemmc" src="https://github.com/user-attachments/assets/b5f33564-6a49-4b0c-bec0-452676e37d29" />
<img width="500" height="589" alt="framerate" src="https://github.com/user-attachments/assets/d8883e79-c9e2-4ed5-85e1-73c642a0d7d1" />
<img width="500" height="351" alt="lastcommand" src="https://github.com/user-attachments/assets/50019701-c1cb-466f-852e-c437fc03b824" />

---

## 3. Why This Module?

Some timecode players (e.g. DOREMIDI MTC-30) have issues with:

* Standard MMC commands not triggering playback
* Unstable behavior when using SysEx only
* Lost communication after reconnect

This module solves those issues by:

* Optionally sending a **native MMC command first (Force MMC)**
* Then executing the **SysEx command sequence**
* Providing a more stable and predictable workflow

---

## 4. Usage Notes

* The **Frame Rate setting only affects SysEx Goto commands**
* Standard MMC Commands do **not** use frame rate
* Recommended workflow:

  * Use **MMC Cue (Goto + Command)** for reliable triggering
  * Enable **Force MMC** if your device occasionally ignores commands

---

## 5. MTC-30 Driver & Tool

* https://www.doremidi.cn/h-pd-106.html
  
<img width="332" height="274" alt="mtc0001" src="https://github.com/user-attachments/assets/7f8ce078-c3ec-40cd-8080-537eee214b2f" />

---
---

# MIDI MMC Command (SysEx) Module - for Chataigne

## 개요

이 모듈은 **MIDI Machine Control (MMC)의 SysEx 명령을 사용하여 타임코드 기반 장비를 제어**하기 위해 제작되었습니다.

특히 **DOREMIDI MTC-30**과 같이 일반 MMC 명령이 제대로 동작하지 않거나, SysEx 기반 제어가 필요한 환경에 최적화되어 있습니다.

---

## 주요 기능

* **MMC Command (SysEx)** 전송 (Play, Stop 등)
* **MMC Goto (SysEx)** 전송 (HH:MM:SS:FF 형식)
* **MMC Cue (Goto + Command)** 시퀀스 실행 (딜레이 설정 가능)
* 장비 안정성을 위한 **Force MMC 옵션**
* **프레임레이트 선택 기능**

  * 24 fps
  * 25 fps
  * 30DP (29.97fps)
  * 30 fps

---

## 이 모듈이 필요한 이유

일부 타임코드 플레이어(예: DOREMIDI MTC-30)는 다음과 같은 문제가 있습니다:

* 일반 MMC Command로 실행되지 않음
* SysEx만 사용할 경우 트리거가 불안정함
* 연결이 끊겼다가 복구되면 명령이 먹지 않는 경우 발생

이 모듈은 다음과 같은 방식으로 문제를 해결합니다:

* 필요 시 **MMC Command를 먼저 전송 (Force MMC)**
* 이후 **SysEx 명령을 실행**
* 안정적이고 반복 가능한 제어 구조 제공

---

## 사용 팁

* **Frame Rate 설정은 SysEx Goto에만 적용됩니다**
* 일반 MMC Command에는 영향을 주지 않습니다
* 권장 사용 방식:

  * **MMC Cue (Goto + Command)** 사용
  * 장비가 간헐적으로 반응하지 않을 경우 **Force MMC 활성화**

---



