---
title: EPROM Programmer
description: Building an EPROM programmer for vintage EPROM's like the 2708 and 2716.
image: EPROM.png
publishedAt: 2022-10-30
authors:
  - name: Ron Moerman
    avatarUrl: https://pbs.twimg.com/profile_images/1583370320261554178/nvAlAh58_400x400.jpg
    link: https://twitter.com/jmanuelsilvapt
tags:
  - EPROM
  - 2708
  - 2716
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---
As part of my efforts to build or expand microcomputers from the seventies and early eighties, I needed an EPROM programmer that could handle those old 2708, 2716 and 2732 type EPROMs.
Of course, I would also need an eraser that uses UV light to reset the content of an EPROM to all 1's, but that was the easy part.
I do know that a lot of EPROMs that are offered at AliExpress and eBay are likely to fail when you try to programme them, but it was worth a shot and online I've read several stories of people that were succesful in programming those old memory ICs.

# Build or Buy?

There are complete programmer devices on the market and some of them could possibly even support these ancient 2708 an 2716 type EPROMs.
But in my search, I found very little details about the option to program these on most commercially available devices.
And given the fact that some will set you back for several hunderd euro's or more, I decided to look for an existing design I could reproduce - with some modifications if needed.

On YouTube I came across a short review of 3 EPROM programmers, on a channel named [Hello World](https://www.youtube.com/watch?v=Gdmsni8cGvY), and that guy compared the XGecu TL866II Plus, the Martin Eberhard ME2700 orphan programmer, and the Willem PCB6.0E SPI/EPROM programmer.
Given their feature set and documentation, the ME2700 was the one for me as it had great documentation and support for 2708 EPROMs.
I contacted Martin and received access to his Google Drive folders with the manual, firmware and parts list.
There were no Gerber files available and after some email exchange, it turned out he had no Gerber files available because he used a special CAD program tailored to a specific PCB manufacter.
As an alternative, I ordered a PCB from him which arrived in the mailbox after about **XXXXXXX weeks**.
Meanwhile I ordered the needed parts that I didn't already have in stock and was ready to assemble the circuit.

# 