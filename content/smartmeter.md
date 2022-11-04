---
title: Smart energy meter - first encounter
description: When moving to a new house, I immediately had a Smart Meter installed (still not sure what is so smart about it...) with the intention to hook-up a device to read the power and gas consumption throughout the day.
image: energie-mon.jpg
publishedAt: 2017-03-29
authors:
  - name: Ron Moerman
    avatarUrl: https://pbs.twimg.com/profile_images/1583370320261554178/nvAlAh58_400x400.jpg
    link: https://twitter.com/jmanuelsilvapt
tags:
  - energy
  - domotics
  - IoT
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---
When moving to a new house, I immediately had a Smart Meter installed (still not sure what's so smart about it...) with the intention to hook-up a device to read the power and gas consumption throughout the day. Well, doing jobs around the house got in the way and a year later I finally started to look into the details of this Smart Meter. After doing some 'research' on Internet, I decided to start at the beginning: the standards for Dutch Smart Meters, since every meter has to comply with those standards.

## Smart Meter overview

The offical website of the [Netbeheer Nederland](http://www.netbeheernederland.nl) organization, a joint initiative of all Dutch powergrid operators, conatins the standards documentation. All relevant documents are located at the [Slimme Meter](http://www.netbeheernederland.nl/themas/hotspot/hotspot-documenten/?dossierid=11010056&title=Slimme%20meter&onderdeel=Documenten) page. Note that there are multiple versions of the so called **DSMR** standard and different models of Smart Meter are installed throughout The Netherlands. So I checked wich Smart Meter was installed in my house (I live in the area where Stedin manages the powergrid): A Landis+Gyr E350 (type ZMF110), for our 3-phase 230V AC electricity connection.

![My Smart Meter](/images/landys.jpg?lightbox=800&cropResize=400,400) {.float_left}

BTW, the 1-phase equivalent is the ZCF110 type. As can be seen on the picture above, the meter clearly specifies DSMR version 4.0, but checking the display info shows the 4.2 version is active (more on the display information later), probably through an update in the last year. BTW. DSMR stands for Dutch Smart Meter Requirements. Newer DSM's may use the newer DMSR v5.x standard, but I have not checked if there is any relevant difference. We also have a 'Smart' Gas Meter which is wirelessly connected to the Landis.

The diagram below (from the DSMR 5.0 standards document, which is much more readable than the older versions) shows the different types of devices and interfaces that make up the energy monitoring ecosystem.

![Energy Monitoring](/images/energy-mon.jpg?cropResize=500,500)

The P0 port (infra red) is the maintenance port at the smart meter. The P1 port, using a TTL Serial protocol, provides the usage data of all connected monitoring devices (like a gas meter). The P2 port, usually wireless and communicating on 868 MHz, is used to collect data from the gas meter (which is also included in the data available on the P1 port) and is based on the M-Bus protocol. The P3 port, also wireless, communicates via GPRS (DLMS CoSEM protocol) to transmits the data from our meter to the transporter of the energy. And the P4 port, which is an open market interface for Independent Service Companies, grid operators, and other suppliers. We are currently only interested in the P1 port. Any system connected to P1 is designated an OSM (Other Services Module) in the DSMR standards description.

The standard allows for multiple 'slave meters' to be attached on the P2 port. This is not limited to gas meters, but can include heat, water and even slave power meters that all communicate with the main meter using the M-Bus protocol (wireless or optionally wired). The rate of data exchange is hourly for the 4.x standard and every 5 minutes for the 5.x standard. And every slave device gets its own M-Bus identifier which shows up in the message send through the P1 interface as we'll see later when disecting the P1 message format.

### The P1 port

Of particular interest is the "P1 companion standard" that describes all the details of the P1 port and can be found on the website of [Netbeheer](http://www.netbeheernederland.nl/publicaties/publicatie/?documentregistrationid=797212672). This is the interface we can use to get readings from the Landis (or any other DSMR-standard meter). From looking at the meter, I concluded that the 4.x version was applicable and the latest publication is DSMR V4.2.2 dated December 16, 2016.

![RJ12 port](/images/rj12.jpg?cropResize=400,400) {.float_right}

The P1 port is a 6p6c socket, commonly referred to as RJ12. The RJ11/RJ12 plug is the one we have known for years as the telephone plug. You can go with an RJ11 plug that has only the 4 middle pins connected, but your best option is to use an RJ12 connection with all 6 wires connected. That way you can optionally use the power output from the P1 port to power the reading device. The 6 pins of the P1 port are wired as shown in the table below.

| PIN | SIGNAL NAME | DESCRIPTION                |
|-----|-------------|----------------------------|
|  1  | +5V         | Power supply line (250mA)  |
|  2  | Request     | Data request (high)        |
|  3  | Data GND    | Ground for the data signal |
|  4  | N.C.        | Not Connected              |
|  5  | Data        | Serial data output signal  |
|  6  | Power GND   | Power ground               |

* Pin 4 is not used.
* Pin 1 and 6 provide power that can be used by a connected device. According to the DSMR 5.0 standard, this output is capable of providing 250mA at 5V. This power output was not available pre-DSMR 4. But the 4.x.x standard does not give details of its maximum load, only the DSMR 5.0 standards description.
* Pin 5 and 3 are the serial output pins and provides a logical 1 with an output voltage of less than 1V, and a logical 0 with an output voltage of more than 4V. This is commonly referred to as TTL Serial. The Landis meter has an open collector output (pin 5), meaning that we need to add a pull-up resistor of 1-2k to allow the data output to switch between these states. Note that the output is inverted, so we'll have to invert the signal by software or hardware. The baudrate is 115200 bps with 8 bits, no parity and 1 stop bit (8N1). Up to DSMR 3.x the rate was only 9600 baud.
* Pin 2 can be used to control the dataflow from the meter. Make this pin high (>4V) to have the meter send it's data on the data output pin. You can either make this permanently high, resulting in a constant flow of meter data every 10 seconds, or only when you want to request data. To stop receiving data, an OSM needs to drop the “Data Request” line - that is, set it to “high impedance”. Data transfer will stop immediately in such case. For backward compatibility reason, no OSM is allowed to set “Data Request” line low (set it to GND or 0V).

The message format for the data coming from the P1 port is based on NEN-EN-IEC-62056-21 mode D spcificiation. Unfortunately this is not freely available, although you may find some information on the Internet. But, the DSMR document gives a complete - albeit somewhat unreadable - list of fields used, so we don't need the IEC-62056 document.

### The Smart Meter display

Let's have a better look at the information that can be presented on the display. By default, the display cycles through the consumed and generated power for tariff T1 and T2, changing the display every 5 seconds. But repeatedly pressing the green button gives us more information. I summarized what is shown on the display in the table below (and the cycle starts with a display test and ends with the text 'End' on the display).

| CODE | EXAMPLE | DESCRIPTION |
|------|-----------|-----------|
| 1.8.1 | 4869 | The power (kWh) delivered to you at tariff 1 |
| 1.8.2 | 4449 | The power (kWh) delivered to you at tariff 2 |
| 2.8.1 |  0 | Thw power (kWh) you delivered back at tariff 1 |
| 2.8.2 | 0 | The power (kWh) you delivered back at tariff 2 |
| 15.7 | 000.333 | Currently used power (kWh) |
| 1.24.1.0 | 00123456 | Serialnumber of connected gas meter |
| 3.0.2.8 | 4.2 | Version of the meter standard (DSMR) |
| 9.4.31.4 | 75 | The signal strength of the GPRS network |

Tariff 1 stands for the low tariff (nights and weekends) in The Nettherlands, and tariff 2 for the high tariff. The DSMR standard supports up to 16 tariffs.

### A closer look at the P1 message

Enough of all that boring background stuff. Let's look at the message that is sent through the P1 port (at 115200/8N1, remember?). First of all, the P1 message is 'human readable', not binary numbers. S o when you hookup a terminal you can actually read the values on your screen.

There can be power usage and delivery information in the P1 message, version information, and it can even invlude the times and duration of the last 3 power interruptions. The maximum length of the message is 1024 characters.

The data sent over the P1 interface consists of a header, the actual data and a closing checksum.

    / X X X 5 Identification CR LF CR LF Data ! CRC16 CR LF

You can find all the possible data fields starting at page 11 of the DSMR 4.2.2. document.
The header is manufacterer specific and contains the device id; e.g. "/XMX5LGBBFFB123456789" for a Landis+Gyr E350 meter.

A complete P1 message looks like this (example recorded from my Landis+Gyr E350 smart meter, DSMR v4.2):

    /XMX5LGBBFFB123456789

    1-3:0.2.8(42)
    0-0:1.0.0(170312105153W)
    0-0:96.1.1(4531303035303031373634393334353235)
    1-0:1.8.1(004951.175*kWh)
    1-0:1.8.2(004526.208*kWh)
    1-0:2.8.1(000000.000*kWh)
    1-0:2.8.2(000000.000*kWh)
    0-0:96.14.0(0001)
    1-0:1.7.0(00.833*kW)
    1-0:2.7.0(00.000*kW)
    0-0:96.7.21(00014)
    0-0:96.7.9(00003)
    1-0:99.97.0(3)(0-0:96.7.19)(160417214213S)(0000002950*s)(151112223157W)(0000088450*s)(151111103556W)(0003079416*s)
    1-0:32.32.0(00001)
    1-0:52.32.0(00001)
    1-0:72.32.0(00002)
    1-0:32.36.0(00000)
    1-0:52.36.0(00000)
    1-0:72.36.0(00000)
    0-0:96.13.1()
    0-0:96.13.0()
    1-0:31.7.0(001*A)
    1-0:51.7.0(001*A)
    1-0:71.7.0(002*A)
    1-0:21.7.0(00.157*kW)
    1-0:41.7.0(00.292*kW)
    1-0:61.7.0(00.382*kW)
    1-0:22.7.0(00.000*kW)
    1-0:42.7.0(00.000*kW)
    1-0:62.7.0(00.000*kW)
    0-1:24.1.0(003)
    0-1:96.1.0(4730303139333430323538383730343135)
    0-1:24.2.1(170312100000W)(02959.773*m3)
    !FCA9

The message starts with an identification header (identified by the '/' character), followed by an emtpy line, the data lines, a closing '!, and ends with a CRC16 checksum.

There is not much information about the identification header in the DSMR documents, other than it being manufacterer specific, starts with a '/' and has the character '5' at the fifth position. The meaning of the characters at positions 2 to 4 is not clear to me, but the characters after the '5' seem to be a meter manufacterer code and serial number.

The CRC16 value is calculated from all characters in the P1 message, starting at the '/' and ending with the '!'. It is calculated using the polynomial: x16+x15+x2+1). CRC16 uses no XOR in, no XOR out and is computed with least significant bit first. The value is represented as 4 hexadecimal ASCII characters (MSB first).

#### Possible data records

Every data line has the same basic format.

    OBIS ( data ) { ( data ) ... } CR LF

It starts with an OBIS reference id, followed by the actual data and terminated with a CR LF. The DSMR document specifies many possible OBIS reference id's that can be included in the message. For now we are interested in the power usage, gas usage and current actual energy usage. I have no solar panels, but will include those fields in my description below as they are identical to the power consumption fields with just a different OBIS reference id. All relevant - to me that is - OBIS codes and the format of their data is presented in the table below. Many OBIS ID's have a device number included (represented by 'n' in the table) that can vary if more than one slave is connected to the smart meter, but in many scenario's it is just a gas meter and that will virtually always get device id '1'.

| OBIS ID | DESCRIPTION | VALUE FORMAT | EXAMPLE |
|---------|-------------|--------------|---------|
| 1-3:0.2.8 | DSMR version. | Unsigned value with 2 digits, no decimal. | (42)<br>DSMR v4.2 |
| 0-0:1.0.0 | Date/time stamp of the P1 message.  | Date and time string in YYMMDDhhmmssX format, where X indicates if Summer time is active (S) or Winter time (W). | (170312105153W)<br>March 12, 2017, 10:51:53h, Winter time |
| 0-n:96.1.1 | Equipment identifier. n=0 represents the smart meter itself.<br>n=1 indicates first slave device on the M-Bus. | Octet string up to 96 characters using hexadecimal characters. Usualy the serial# as shown on the device. | (4530303041424344313233343536373839)<br>'E000ABCD123456789' |
| 1-0:1.8.1 | Meter reading of total electricity delivered to you (tariff 1), with 0.001 kWh accuracy. | Unsigned value with 6 digits before and 3 digits after the decimal point, followed by "\*kWh". | (004951.175*kWh) |
| 1-0:1.8.2 | Meter reading of total electricity delivered to you (tariff 2), with 0.001 kWh accuracy. | Unsigned value with 6 digits before, and 3 digits behind the decimal point, followed by "\*kWh". | (004526.208*kWh) |
| 1-0:2.8.1 | Meter reading of total electrical power delivered by you (tariff 1), with 0.001 kWh accuracy. | Unsigned value with 6 digits before and 3 digits behind the decimal point, followed by "\*kWh". | (000000.000*kWh) |
| 1-0:2.8.2 | Meter reading of total electricity delivered by you (tariff 2), with 0.001 kWh accuracy. | Unsigned value with 6 digits before and 3 digits behind the decimal point, followed by "\*kWh". | (000000.000*kWh) |
| 0-0:96.14.0 | Electricity tariff indicator. Can be used to switch tariff loads. | Four digit octet string using hexadecimal characters. Dutch tariff can be 1 or 2. | (0001)<br>Tariff 1 is active. |
| 1-0:1.7.0 | Actual electricity power delivered to you (+P) in 1 Watt resolution. | Unsigned value with 2 digits before and 3 digits behind the decimal point, followed by "\*kWh". | (00.833*kW) |
| 1-0:2.7.0 | Actual electricity power received from you (-P) in 1 Watt resolution. | Unsigned value with 2 digits before and 3 digits behind the decimal point, followed by "\*kWh". | (00.000*kWh) |
| 0-0:96.7.9 | Number of long power failures in any phase | Unsigned value with 5 digits, no decimal point. | (00003) |
| 0-n:24.1.0 | Device type for the gas meter (the only MBUS slave attached), with n=1. | Unsigned 3 digit value. | (003) |
| 0-1:24.2.1 | Last 5-minute value (temperature converted), gas delivered to you in m3, including decimal values and capture time. Measured hourly. |Timestamp, followed by unsigned value with 5 digits before and 3 digits after decimal point, followd by unit of measurement. | (170312100000W)(02959.773*m3)<br>2959.773 m3 gas as measured on March 12 2017, 10:00:00 |

All data records, except OBIS id 1-0:99.97.0, have only one value. And since I'm not interested in this record, we will assume that all message lines have exactly one value (between parenthesis).

#### OBIS identifier examined

The OBIS reference id has 5 fields:

    M - n : X . Y . Z

The first field (M), being a '1' or a '0', seems to indicate whether this data records is about the electricity meter values (1) or something else (0). I didn't spend enough time digging through the (hardly readable) OBIS documentation to find a definitive reference to this. Since this field is not needed to uniquely identify a data record, we'll just ignore it for now.

The second field (n) is a device identifier of the (slave) device on the M-Bus, or '0' when it's the smart meter itself or other (external) data. There can be up to 4 devices connected on an M-Bus, either wired or wireless. Almost all Dutch households have both a smart electrical power and gas meter that are connected through the M-Bus. The smart meter for electricity being the 'master' device (id '0') and the gas meter a slave, usualy with M-Bus id '1'. But let's find out what device type the gas meter should have, so we can formally identify the proper device channel. Details can be found in the [M-Bus protocol description](http://www.m-bus.com/files/w4b21021.pdf) document on page 6-7. There we can see that the gas meter has device type 3, which was to be expected since the message I retrieved from the smart meter mentions a device type of '(0003)'. Any slave electricity meter would have device type 2, by the way. The message line with OBIS *0-1:24.1.0(003)* shows the gas meter device type.

The third field is an OBIS category identifying the class of data presented. I have not figured out the details as these values are predefined, but use them as a given number (one or 2 digits).

The same goes fot the remaining two fields.

#### P1 message values

Way back at the university, I learned compiler building and one of the steps was to create a BNF syntax diagram to be able to parse the source code properly with all it's syntax variations. I figured that could be a good way to get a grip on the parsing algorithm needed to interpet the message lines.

    digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    character = digit | letter
    number = digit {digit}
    string = {character}
    Fn(n,m) = 1*n digit . *m digit
    Sn = 1*character

Note that the official DSMR standard mentions floating point numbers with a variable number of fractional digits. However, all actually used numbers in a P1 message have a fixed number of fractional digits behind the decimal point (if any), up to 3 digits. This makes using real (binary) floating point numbers in the software unnecessary. We can just save these values as integers in thousands of the original unit, effectively removing the decimal point. As an example, the power consumption value of 004951.175 kWh, is stored 4951175 Wh in an integer variable.

## Reading the P1 message

Before diving into the details of designing and building a full blown device te read and store the smart meter data, let's try to read something from the P1 interface. Depending on the type of smart meter, there are some differences in the way the message is sent. For instance, older meters send at 9600 baud, while the 4.x and 5.x standard defines a rate of 115200 baud with 8 data bits, no parity and 1 stop bit. Furthermore the interface is a so called TTL level serial interface, meaning the signals run between 0V and 5V for logic high/low states. Actually, the interface sends reversed signals for low and high levels so we must inverse that before feeding it to a serial interface on a microcontroller.

An easy way to get some initial readings from the smart meter is to setup a Raspberry Pi (Model 3 is the simplest as it has built-in WiFi and BlueTooth), install Raspbian on it and enable WiFi connectivity (or connect through Ethernet) and SSH. Some details for the setup:

    1. Enable the serial interface (via raspi-config).
    2. Disable the console on serial0 (change /boot/command.txt and remove references to serial0).
    3. Install minicom (apt-get install minicom).
    4. Connect the P1 port (see details below).
    5. Run minicom and set the correct serial parameters (115200 8N1).

The P1 messages should show up on the console screen every 10 seconds.

To connect the P1 port of a Landis+Gyr E350 smart meter to a Raspberry Pi 3 you can use the following schematic.

![P1 to Pi](/images/p1topi.jpg?cropresize=400,400) {.float_right}

Two noteworthy things: First, the Landis has a so called 'open collector output' - a kind of floating output - and needs a pull-up resistor of 1k to switch between low (<1V) and high (>4V). Furthermore, the serial TTL signal is inverted so it must be inverted again before feeding it to the Raspberry Pi serial interface. I used a 7404 hex-inverter since I have plenty laying around,but a simple FET (transistor) and resistor could do as well. Plug it in,add power to the Pi 3 and on your computer connect to the Pi via SSH. Start minicom and see the data flowing.

## Next

Now that we have a decent understanding of the data coming out of the P1 port of the Smart Meter and how to connect it, we can start working on the actual hardware and software design. But that's a topic for another next blog.
