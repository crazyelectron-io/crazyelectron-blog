---
title: Working with EPROMs, part 1 - EPROM Emulators
description: Building an EPROM emulator to test softwasre before flashing it to old EPROMs like the 2716 that might otherwise wear out too soon, not to mention the time it takes for one test cycle...
image: eprom-emu-ng.png
publishedAt: 2022-10-30
authors:
  - name: Ron Moerman
    avatarUrl: https://pbs.twimg.com/profile_images/1583370320261554178/nvAlAh58_400x400.jpg
    link: https://twitter.com/jmanuelsilvapt
tags:
  - EPROM
  - 2716
  - 2732
  - Emulator
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---
As part of my efforts to build or expand microcomputers from the seventies and early eighties, I needed an EPROM programmer that could handle those old 27xx type EPROMs.
The ones with 24 pins and for future projects support for 28 pin EPROMS would also be nice.
While looking for designs of EPROM programmers, it occured to me that an EPROM emulator would also be an essential tool for developing the software before it is burned in an EPROM as it shortens the development cycle drastically and prevents these good old EPROMS from wearing out too soon.
There are basically two ways to emulate an (EP)ROM: in-circuit by mimicking an (EP)ROM using static RAM that is written directly by the system under development, or by 'programming' the RAM in an emulater (also mimicing an (EP)ROM from a development system, using a so-called _dual port RAM_ circuit.
Since my current target system, the MEK6800D2, has very limited memory capacity (only 768 bytes of RAM), I opted for the externally programmed EPROM emulator.
The in-circuit emulator might be an option for future support of an 2708, but for now I skipped support of the 2708 altogether, partly because they are quite old and harder to get your hands on working specimens and partly because they require +12 V and -5 V in addition to +5 V, which complicates things a bit.

## EPROM Emulator 1-O-1

In essence, an EPROM emulator is just an piece of RAM of at least the required capacity for the EPROM to be emulated with two separate and mutually exclusive data and address busses; one to connect the emulator to the circuit under test and mimic an EPROM, the other to allow a development system to write the bytes to the RAM of the emulator.
As you can imagine, those actions should not happen at the same time; if one bus is accessed, the other should be blocked.
Therefor, I still very much like the cartoon in the September 1977 edition of Elektuur (Elektor) that visualizes it by way of a lock.

![EPROM Emulator cartoon](sluis.png)

## Build or Buy?

In my search for EPROM emulator designs to use a a starting point I stumbled upon the work of Kris Sekula.
His [EPROM Emulater NG](https://github.com/Kris-Sekula/EPROM-EMU-NG) seemed exactly what I needed and it had all the sources and KiCAD files for the schematics and PCB on GitHub.
It supports all 27xx(x) EPROMS upto 256k bit, except the 2708, from the 2716 to the 27256.
So, it looks like this is going to be a short blog post as I decided to be lazy and start ordering the PCB and the parts to built one.
Note that Kris also sells assembled systems for those who don't want to built it themselves.

To my surpirise almost all parts were readily available, only one or two were on backorder from the manufacturer.
Since my first order of business was to program 24-pin EPROMs, I ordered parts for two cables, one for 24-pin DIP sockets and one for 28-pin sockets, making it more future-proof.

[... to be continued when the PCB and parts have arrived...]
