---
title: Recreating the Motorola MEK6800D2 kit, part 1
description: Create a new MEK6800D2 Evaluation Kit from scratch using as much as possible from the original design and parts.
image: MC6800.png
publishedAt: 2022-10-22
authors:
  - name: Ron Moerman
    avatarUrl: https://pbs.twimg.com/profile_images/1583370320261554178/nvAlAh58_400x400.jpg
    link: https://twitter.com/jmanuelsilvapt
tags:
  - MC6800
  - MPU
  - Retro
  - PCB
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---
## How it all started

When I was in elementry school, my friend Rick had an uncle who was radio amateur.
One day I came along with my friend to visit his uncle and when I saw all that fascinating radio equipment I was hooked.
Back home I began to experiment with basic stuff like a crystal radio and started to read electronics magazines, like Elektor (which was called Elektuur in The Netherlands back then).
Within a few years I was buidling amplifiers for a few of my friends and experimented with small radio transmitters.
As an avid reader of every issue of Elektuur, there was this defining moment in my life when the May 1977 edition dropped on the doormat.
It had an article about a microprocessor from National Semiconductors with the nickname **SC/MP** (its official part number was ISP-8A/500D).
I ordered the PCB from Elektuur and went to the only electronics shop in my area (DIL Elektronics in Rotterdam) to get all the parts.
While waiting for the PCB to arrive, I dove into the details of the SC/MP instructionset and started to write down a few small programs (in Hex code!) I could run on it.
The Elektuur SC/MP was a very basic system with only 256 bytes of RAM, DIP-switches for address and data entry and just 8 LEDs as 'output device'.
I still remember the thrill I felt when, after quickly building it, I programmed a simple running lights program and saw the LEDs lighting up one by one.

### Some background

After experimenting with the very limited SC/MP system for a while, I wanted more.
Elektuur had published a few articles about expanding it with memory, I/O etc., but by then I had found out about other microprocessors that were more advanced like the MOS 6502 and Motorola 6800 Microprocessers.
I particularly liked the clean en powerfull instructionset and registers of the MC6800 and because parts were not that easy to come by, I bought an evaluation kit that had all the parts needed to assemble a complete system: the **Motorola MEK6800D2 Evaluation Kit II**.
The MEK6800D2 had an hexadecimal keypad with additional keys for running, storing, reading and stepping through memory and registers, and it had 6 7-segment displays as 'output device'.
Somehow I have lost (misplaced) it along the way and now that I am growing older (and much more grey hair) I often think back to those days.

This documents the journey I took to recreate the original MEK6800D2 using as much of the original design and components as possible.
Some parts will be hard - if not impossible - to get hold of, like the 6830 1024x8 ROM that was factory preprogrammed with the Motorola JBUG monitor.
For these parts I have searched for alternative solutions.
Although tempted, I stayed away from improvements like increasing ROM and RAM or adding USB, etc.
I also kept the 2-board design with the separate display/keyboard PCB.
The EXORciser bus connector was one of the few items I left out of the redesigned system, as well as the components driving that bus.
That way I could reduce the size (and price) of the CPU/Memory board considerable.

## Difficult parts

Before finishing the PCB design, I had to make sure which parts would end up on that PCB before sending the Gerber files to the PCB shop.
I started out on a journey seeking all the needed parts, looking in places like eBay, but also the webshop of specialized companies and reputable electronics components suppliers like Farnell, Mouser, DigiKey and RS Components.
To my surpirise, one of the places for parts that are no longer in production turned out to be specialized Pinball retro shops.
In hindsight that makes sense since the 6800 was quite popular those days for gaming hardware and industrial equipment.

The CPU, PIA and RAM were easy to find as well as most of the CMOS and TTL logic IC's.
One very small change regarding the PIA IC's: my original MEK/D2 had the 6820 which is very rare nowadays and I could simply replace it with the 6821 as that is a 100% drop-in replacement.

### Clock challenges

The clock generator IC used in the original MEK was an MC6871B rated at 614.4 kHz.

<alert>Fun fact: this strange clock frequency was choosen by Motorola so that they could easily get a 2400 Hz signal for the cassette interface by divinding it by 256).
This is a rather specilized clock generator because the 6800 CPU needed two non-overlapping clock signals.
Later models, like the 6802 and 6809 had the clock circuitry on the chip, simplifiying the designs.</alert>

I could only find the MC6871B in a few obsure places for high prices and no guarantee they would work at all.
This prompted me to look for alternatives, which turned out to be it's sibbling the MC6875 which I found more readily available on reputable retro computer shops like [Corshamtech](https://www.corshamtech.com/product/mc6875-clock-generator/).
Of course that ment that I could not generate the 2400 Hz signal that easy anymore.
More on that later.

### JBUG ROM replacement

Another hurdle to take was the 1024x8 bit [MCM6830 ROM](/datasheets/MCM6830.pdf) programmed (hard-wired) with the JBUG monitor program.
I decided to design a replacement circuit based on an EPROM to stay as close to the original design as possible, as I only want to use parts that were available around that time.
A search on the internet archives for information came up with the Motorola datasheet for the MCM68A30A/MCM68B30A, from which I could get the details of the pin assignments and other details.
However, as the datasheet states: "The active level of the Chip Select inputs and the memory content are defined by the customer".
Translated: Motorola 'backed' a configuration in that ROM with two Chip Selects that I should reproduce somehow, but details of the 6830 in the MEK6800D2 are scarce.

The Vintage Computer Federation forum had a [few posts](https://forum.vcfed.org/index.php?threads/gw-6830-1-a-replacement-for-motorola-6830-mask-roms.79067/) from November 2020 about a guy creating a plug-in replacement using an Atmel AVR with built-in EEPROM to mimic the behaviour of the ROM and the Chip Select lines.
I asked a follow-up question in that forum and promptly got a reply from two different people with more details.
With that input, I could start designing for the 6830 replacement, which - as I stated - should be a component from that same seventies period.
The 2708 EPROM was a logical choice, although it meant I had to add additional voltage levels, like -12V, to drive the 2708.
I could also opt for a 2716 type EPROM, which did not need -12V, but for now I will try and get my hands on a few 2708's and if that fails, I'll switch to using 2716's.
And in both cases, I also have to build an EPROM programmer and UV eraser!

### Optional EPROMs

At address $C000 an optional PROM can be used that could be any 2708 (1Kx8) EPROM or pin-compatible IC.
I never used it in the original MEK but the schematics mention that an MC68708, MCM7641 or MCM68317 could be used.
These days 2708's are no longer produced, but on eBay there are still many parts available, so I decided to order a few.

[... to be continued...]
