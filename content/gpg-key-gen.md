---
title: 6 steps to protect your secrets on Github
description: Secure your secretswith GPG keys  while storing them in a public Github repository.
image: git-secret.png
publishedAt: 2021-06-02
authors:
  - name: Ron Moerman
    avatarUrl: https://pbs.twimg.com/profile_images/1583370320261554178/nvAlAh58_400x400.jpg
    link: https://twitter.com/jmanuelsilvapt
tags:
  - PGP
  - Github
  - Encryption
link: https://codesandbox.io/embed/nuxt-content-l164h?hidenavigation=1&theme=dark
---
When managing configuration files for your programs, Home Automation, automated deployment tools, API access etc., it is not always avoidable to store secrets, like passwords or API keys, in certain files.
Obviously, those secrets should not end up in a publicly accessible repository on GitHub.
It would be unfortunate if we could not use GitHub, a great place to store versions of our files and allows us to restore it on another system or revert a change, among other well known virtues of a repository.
We could opt for a private repository, but even then I would not feel comfortable to store for instance the code to deactivate an alarm as part of my Home Automation configuration files in there.
Encryption can protect our secrets from prying eyes, but encrypting and decrypting files can be quite cumbersome and we should definitely not forget to encrypt our secrets again before uploading a change!
Fortunately, there are non-intrusive ways to protect secrets in a publicly accessible repository.
One of those tools is `git-crypt`, which uses OpenPGP keys to encrypt and decrypt sensitive files.
There is some complexity involved in the initial setup, but once that is done, it is mostly automated.

Before diving into the detailed steps to secure repository files, let's give an overview of what we need to do before we can sleep well, being asured that our secrets are safe in a public repository.
It starts with creating a GPG key that can be used to encrypt and decrypt repository files.
This key must be stored inside the local Git repository, in the `git-crypt` key vault to be precise.
When files are pushed to the remote repository, they are encrypted, if specified in the Git meta-data file.
And to be able to allow collaborators to work on the repository, we can add their PGP key to the `git-crypt` vault as well.

## Prerequisites

This 'how-to' is based on macOS and Debian/Ubuntu but should work equally well on most other Linux distributions, and even for Windows the steps are mostly identical.
Before we can start using `git-crypt`, we need a working Git and GPG configuration.
Setting up our system to work with Git repositories is quite easy, and you probably already have done that.
If not, look at other places for help on setting up Git first.
Make sure your global Git parameters for `user.name` and `user.email` are set correctly for use with GitHub.
An easy way to check your Git configuration is by using the command `git config --global --list` as it will show you the global Git parameters like `user.name` and `user.email` that are used for Git commands like `commit` and `push`.

The other key component used by `git-crypt` is GnuPG (GNU Privacy Guard), which is described [here](https://gnupg.org/).
We go into de detailed steps and describe the setup and usage of `git-crypt` soon, but since it needs a key to do it's magic, we'll start with `GnuPG`.

**GnuPG** is a well-known open source product that can generate and manage your private/public key pairs.
It is a widely used implementation of the OpenPGP standard.
It defines a hybrid encryption framework based on the notion of [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust).
You will find a nice GPG tutorial [here](https://futureboy.us/pgp.html).
These public keys can be shared with the world to allow the verification, and there are even public repositories to store and retrieve them.
But, since the focus of this article is to create a way to secure our secrets in public repositories, we'll focus on the generation and usage of GPG for this purpose.

### Install GnuPG

There is a package in the Debian and Ubuntu repository for GnuPG, as well as a Homebrew package for macOS, so there is no need to install from source.
For other Linux distributions and Windows, there are also installation packages available, but they are not covered here.
More information can be found on the [download page](https://www.gnupg.org/download/index.html) of the official [GnuPG website](https://www.gnupg.org).

<code-group>
  <code-block label="Debian/Ubuntu" active>

 ```shell
sudo apt update
sudo apt install gpg
```

  </code-block>
  <code-block label="macOS">

```shell
brew install gnupg
```

  </code-block>
</code-group>

<alert>The examples shown in this article are based on a MacBook Pro with M1 SoC which is an ARM64-based architecture, running Big Sur</alert>

The GnuPG package will be installed as shown below.

<code-group>
  <code-block label="Debian/Ubuntu" active>

```shell
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  gnupg gpg-wks-client gpg-wks-server
Suggested packages:
  parcimonie xloadimage
The following NEW packages will be installed:
  gnupg gpg gpg-wks-client gpg-wks-server
0 upgraded, 4 newly installed, 0 to remove and 16 not upgraded.
Need to get 0 B/2,793 kB of archives.
After this operation, 3,805 kB of additional disk space will be used.
Do you want to continue? [Y/n]
Selecting previously unselected package gpg.
(Reading database ... 41233 files and directories currently installed.)
Preparing to unpack .../gpg_2.2.27-2+deb11u2_amd64.deb ...
Unpacking gpg (2.2.27-2+deb11u2) ...
Selecting previously unselected package gpg-wks-client.
Preparing to unpack .../gpg-wks-client_2.2.27-2+deb11u2_amd64.deb ...
Unpacking gpg-wks-client (2.2.27-2+deb11u2) ...
Selecting previously unselected package gpg-wks-server.
Preparing to unpack .../gpg-wks-server_2.2.27-2+deb11u2_amd64.deb ...
Unpacking gpg-wks-server (2.2.27-2+deb11u2) ...
Selecting previously unselected package gnupg.
Preparing to unpack .../gnupg_2.2.27-2+deb11u2_all.deb ...
Unpacking gnupg (2.2.27-2+deb11u2) ...
Setting up gpg (2.2.27-2+deb11u2) ...
Setting up gpg-wks-client (2.2.27-2+deb11u2) ...
Setting up gpg-wks-server (2.2.27-2+deb11u2) ...
Setting up gnupg (2.2.27-2+deb11u2) ...
Processing triggers for man-db (2.9.4-2) ...
```

  </code-block>
  <code-block label="macOS">

```shell
Updating Homebrew...
==> Auto-updated Homebrew!
Updated 2 taps (homebrew/core and homebrew/cask).
==> New Formulae
cherrytree                    grokmirror                    htmltest                      mpdecimal
==> Updated Formulae
Updated 166 formulae.
==> Renamed Formulae
glibmm@2.64 -> glibmm@2.66                                  pangomm@2.42 -> pangomm@2.46
==> New Casks
digital                                                     slippi-dolphin
==> Updated Casks
Updated 251 casks.
==> Deleted Casks
archi                                   oni                                     project-slippi-dolphin

==> Downloading https://homebrew.bintray.com/bottles/libgcrypt-1.9.1.arm64_big_sur.bottle.tar.gz
==> Downloading from https://d29vzk4ow07wi7.cloudfront.net/7849af82fef5359891b5422fd91bd2d91c348885b948d05a9979997d9c7b
######################################################################## 100.0%
==> Downloading https://homebrew.bintray.com/bottles/gnupg-2.2.27.arm64_big_sur.bottle.tar.gz
Already downloaded: /Users/ron/Library/Caches/Homebrew/downloads/11ee1dfc3aa276cd2c935f515a16a328f9928a35d25c68bd443d4f86751eb2a9--gnupg-2.2.27.arm64_big_sur.bottle.tar.gz
==> Installing dependencies for gnupg: libgcrypt
==> Installing gnupg dependency: libgcrypt
==> Pouring libgcrypt-1.9.1.arm64_big_sur.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libgcrypt/1.9.1: 23 files, 3.1MB
==> Installing gnupg
==> Pouring gnupg-2.2.27.arm64_big_sur.bottle.tar.gz
🍺  /opt/homebrew/Cellar/gnupg/2.2.27: 140 files, 12.2MB
```

  </code-block>
</code-group>

Let's check the result by displaying the version of the GnuPG packages.

<code-group>
  <code-block label="Debian/Ubuntu" active>

```shell
❯ gpg --version
gpg (GnuPG) 2.2.27
libgcrypt 1.8.8
Copyright (C) 2021 Free Software Foundation, Inc.
License GNU GPL-3.0-or-later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: /home/user/.gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

  </code-block>
  <code-block label="macOS">

```shell
gpg (GnuPG) 2.3.8
libgcrypt 1.10.1
Copyright (C) 2021 Free Software Foundation, Inc.
License GNU GPL-3.0-or-later <https://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Home: /Users/me/.gnupg
Supported algorithms:
Pubkey: RSA, ELG, DSA, ECDH, ECDSA, EDDSA
Cipher: IDEA, 3DES, CAST5, BLOWFISH, AES, AES192, AES256, TWOFISH,
        CAMELLIA128, CAMELLIA192, CAMELLIA256
AEAD: EAX, OCB
Hash: SHA1, RIPEMD160, SHA256, SHA384, SHA512, SHA224
Compression: Uncompressed, ZIP, ZLIB, BZIP2
```

  </code-block>
</code-group>

When GnuPG starts for the first time there is no keybox yet, so it will create one in `~/.gnupg`.
Let's do that now, just to show the file and directory being created.
Since GnuPG will enter an interactive shell, we must exit with `Control-C`.

<code-group>
  <code-block label="Debian/Ubuntu" active>

```
$ gpg
gpg: directory '/home/user/.gnupg' created
gpg: keybox '/home/user/.gnupg/pubring.kbx' created
gpg: WARNING: no command supplied.  Trying to guess what you mean ...
gpg: Go ahead and type your message ...
^C
gpg: signal Interrupt caught ... exiting
```

  </code-block>
  <code-block label="macOS">

```shell
❯ gpg
gpg: directory '/Users/me/.gnupg' created
gpg: keybox '/Users/me/.gnupg/pubring.kbx' created
gpg: WARNING: no command supplied.  Trying to guess what you mean ...
gpg: Go ahead and type your message ...
^C
gpg: signal Interrupt caught ... exiting
```

  </code-block>
</code-group>

The first order of business is to generate a _key to rule all keys_.
This key will be used only for authentication and certification and subkeys are created for specific tasks.
For use with `git-crypt` and other systems, we will generate subkeys and not use the primary key.

### Generate the primary key

To generate a decent primary key, use the `--expert` flag which exposes additional menu choices.
Make sure to select an _RSA key_ and disable _Signing_ and _Encryption_ for the primary key.
Also, as per [this](https://debian-administration.org/users/dkg/weblog/97) advice, we will leave the comment field blank.
One more advice before we start generating the key: make sure to use a very strong passphrase.
I suggest to use a password manager for storing it safely.

```shell
gpg --full-generate-key --expert
```

As shown below, we will disable the sign and encrypt options for this key as it is only used for certifying.
Make sure to enter a strong passphrase for this 'key of all keys'
After entering your name and email address, the 4096-bit RSA key will be generated.

```shell
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC and ECC
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Sign Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? s

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? e

Possible actions for a RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 2y
Key expires at vr 27 jan 21:42:46 2023 CET
Is this correct? (y/N) y

GnuPG needs to construct a user ID to identify your key.

Real name: YOUR NAME
Email address: me@example.com
Comment:
You selected this USER-ID:
    "YOUR NAME <me@example.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: /Users/me/.gnupg/trustdb.gpg: trustdb created
gpg: key E036D0B7C42018B1 marked as ultimately trusted
gpg: directory '/Users/me/.gnupg/openpgp-revocs.d' created
gpg: revocation certificate stored as '/Users/me/.gnupg/openpgp-revocs.d/1162C708CBEF34AF112391CFE096D0B7C42018CD.rev'
public and secret key created and signed.

ub   rsa4096 2021-02-11 [C] [expires: 2024-02-11]
      F806033A4E362927630AC23C2F80A75D623F82CD
uid                      YOUR NAME <me@example.com>
```

You now have a new OpenPGP (4096-bit RSA) primary key for certifying other keys.
Prove it to yourself by running the following command.
It shows the _key id_ as well as your name and email address.
Notice that the key is stored in the `~/.gnupg/pubring.kbx` file.

```shell
❯ gpg -K
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
gpg: next trustdb check due at 2023-01-30
/Users/me/.gnupg/pubring.kbx
-----------------------------
sec   rsa4096 2021-02-11 [C] [expires: 2024-02-11]
      F806033A4E362927630AC23C2F80A75D623F82CD
uid           [ultimate] YOUR NAME <me@example.com>
```

By default, the encryption preferences specified in the generated public key are probably not as strong as they could (and should) be.
To highten security even further, we will set stronger security preferences, in particular use AES256, SHA512 and ZLIB by default.
Note that the command shown below specifies the _key id_ as shown by the `gpg -K` command before.
Enter the following command to edit the key:

```shell
gpg --edit-key F806033A4E562937630EC23C2F80A75D623F82CD
```

This enters an interactive GnuPG shell, indicated by the `gpg>` prompt where we can enter specific commands to edit the key.
First, change the preference to use only the more secure options with the `setpref` command.
Then, check the updated settings with the `showpref` command before saving the changes with the `save` command.
Note that you'll have to enter the passphrase to access the key.

```shell
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/2F80A75D623F82CD
     created: 2021-02-11  expires: 2024-02-11  usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). YOUR NAME <me@example.com>

gpg> setpref SHA512 SHA384 SHA256 SHA224 AES256 AES192 AES CAST5 ZLIB BZIP2 ZIP Uncompressed
Set preference list to:
     Cipher: AES256, AES192, AES, CAST5, 3DES
     AEAD:
     Digest: SHA512, SHA384, SHA256, SHA224, SHA1
     Compression: ZLIB, BZIP2, ZIP, Uncompressed
     Features: MDC, AEAD, Keyserver no-modify
Really update the preferences? (y/N) y

sec  rsa4096/2F80A75D623F82CD
     created: 2021-02-11  expires: 2024-02-11  usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). YOUR NAME <me@example.com>

gpg> showpref
[ultimate] (1). YOUR NAME <me@example.com>
     Cipher: AES256, AES192, AES, CAST5, 3DES
     AEAD:
     Digest: SHA512, SHA384, SHA256, SHA224, SHA1
     Compression: ZLIB, BZIP2, ZIP, Uncompressed
     Features: MDC, AEAD, Keyserver no-modify

gpg> save
```

The key fingerprint is a shorthand signature for the key.
It allows us to confirm to others that they have received our actual public key without any tampering.
There is no need to write this fingerprint down as we can display the fingerprint at any time, using the below command (specify the email address assigned to the key).

```shell
❯ gpg --fingerprint me@example.com
ppub   rsa4096 2021-02-11 [C] [expires: 2024-02-11]
      F806 033A 4E36 2927 630A  C23C 2F80 A75D 623F 82CD
uid           [ultimate] YOUR NAME <me@example.com>
```

### Sharing and securing your key

#### Export keys

Obviously, we should not loose this 'master key' and a backup to a secure location is advisable.
Use the following command to make a backup file to store in a secure location.

```shell
❯ gpg --export-secret-keys --armor me@example.com > gpg-privkey.asc

❯ cat gpg-privkey.asc
-----BEGIN PGP PRIVATE KEY BLOCK-----

lQdGBGAVvRgBEACkcNuMG0KtMzq+JP6cYnbNAY+hUzOi6+F8k8bW0f+g4r233i7Q
wtXjg7J1lDlt0UTGH1VgIhto84b5fXUdVgR2Ld6KhZf8E9yQQNNXuqHvOUOeR37l
  ...

-----END PGP PRIVATE KEY BLOCK-----
```

If you want to export your public keys you can use the following command.

```shell
❯ gpg --export --armor me@example.com > gpg-pubkey.asc

❯ cat gpg-pubkey.asc
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGAVvRgBAACkdNuMG0KtMzj+JP6cYnbNAY+hUzOi6+F8k8bW0f+g9r233j7Q
  ...

-----END PGP PUBLIC KEY BLOCK-----
```

By making the public key available to others, they can verify signed communications, or send us encrypted communications if necessary.
Use the following command to send the public key to the GNUPG default public key server (**keys.gnupg.net**).
This will take a while, so be patience.

```shell
❯ gpg --keyserver certserver.pgp.com --send-key F806033A4E362927630AC23C2F80A75D623F82CD
gpg: sending key 2F80A75D623F82CD to hkp://certserver.pgp.com
gpg: keyserver send failed: Operation timed out
gpg: keyserver send failed: Operation timed out
```

Be aware thet the key server can sometimes be offline or very busy as shown above.
In that case, just try again later.

#### Backups

It cannot be stressed enough: treat your secret key as you would any very important document or physical key.
If you lose your secret key, you will be unable to sign communications, or to open encrypted data.
If you followed the above, you have a secret key which is just a regular file that you store somewhere safe for backup purposes.
An even more secure model than keeping the key on disk is to use a hardware token.
There are several options available on the market, but make sure the token advertises OpenPGP support.
See [this blog entry](https://blog.josefsson.org/2014/06/23/offline-gnupg-master-key-and-subkeys-on-yubikey-neo-smartcard/) for how to create a key with offline backups, and use the token for online access.

It is not advisable to copy GnuPG data between systems by copying the entire `.gnupg` directory, but for backup/recovery purposes it can be usefull to make a temporary backup when you are trying a new command or feature, for instance.
The command to create an archive of the entire directory and subdirectories while exluding any sockets is:

```shell
❯ umask 077; find $HOME/.gnupg ! -type s ! -type d -exec tar -cf $HOME/gnupg-backup.tar {} +
tar: Removing leading `/' from member names
tar: Removing leading `/' from hard link targets
```

<alert>Remember: this backup file contains all your keys!</alert>

### Revoking keys

Revoking a key withdraws it from public use.
That should only be necessary if it is compromised or lost, or we don't remember the passphrase.
When creating the key pair, GnuPG also creates a key revocation certificate and stores it in `~/.gnupg/openpgp-revocs.d` as could be seen in the output of the key generation step before.

```shell
  ...
gpg: revocation certificate stored as '/Users/me/.gnupg/openpgp-revocs.d/13EED974518E3C278A5B802C137694C262ACE8CCD.rev'
  ...
```

When issueing the revocation certificate later, it notifies others that the public key is not to be used.
They may still use a revoked public key to verify old signatures, but not encrypt messages anymore.
As long as we still have access to the private key, data encrypted previously may still be decrypted.
But if we forget the passphrase, we will not be able to decrypt data encrypted to that key.
This revocation certificate should be moved to a medium no one can access but you.
If someone gets access to this certificate, it can be used to make your key unusable.
One safe option is to print this certificate and store it away, just in case your media become unreadable.

We're now _finally_ done with our primary key and ready to generate a subkey for `git-crypt` usage.

## Generate git-crypt subkey

We will use the primary key created just now only for signing other keys, which happens infrequently.
Day to day, we will use subkeys for signing, authentication and/or encryption of sensitive data (like a Git repository, ssh key or mail).

<alert>It is highly recommended to create separate subkeys for different usecases.</alert>

We will now add a subkey for `git-crypt` with the `addkey` command in the interactive edit mode of `gpg`.
Make sure to set the key to only allow _encryption_, not signing, select a 4096-bit size, and an expiration date of less than 2 years for this subkey (let's use 18 months).
We will create the subkey by editing our existing key.
We need to edit the key in _expert mode_ again to get access to the appropriate options.

```shell
❯ gpg --expert --edit-key F806033A4E362927630AC23C2F80A75D623F82CD
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/2F80A75D623F82CD
     created: 2021-02-11  expires: 2024-02-11  usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). YOUR NAME <me@example.com>

gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 8

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? s

Possible actions for a RSA key: Sign Encrypt Authenticate
Current allowed actions: Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? q
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 18m
Key expires at do 21 jul 23:03:18 2022 CEST
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/2F80A75D623F82CD
     created: 2021-02-11  expires: 2024-02-11  usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/CA496A9DC77CD1DE
     created: 2021-02-11  expires: 2023-02-11  usage: E
[ultimate] (1). YOUR NAME <me@example.com>

gpg> save
```

Confirm that the subkey is created by looking at the line starting with **ssb** above.
It has the _key id_ of the subkey just generated.
When performing actions on a (sub)key we can use either the username, short _key id_ or (longer) fingerprint.

To retrieve the key id and fingerprints of the key and subkey(s) later, you can use additional command line options like `--with-fingerprint` and `--with-subkey-fingerprint` to get all the required fingerprints to use in other commands.
It is also possible to add those options as default to the GnuPG configuration by adding these options without the leading `--` to the `~/.gnupg/gpg.conf` file, like this:

```ini
keyid-format long
with-fingerprint
with-subkey-fingerprint
```

When listing keys, you will get all the details without the need for additional options on the command line.
The only bad thing about GnuPG is that it displays the fingerprints with a space between each hex byte, so we need a little tweaking to make the output usefull for other commands that require the fingerprint as input.

```shell
❯ gpg --with-colons --list-keys | grep fpr | cut -d ':' -f 10
F806033A4E362927630AC23C2F80A75D623F82CD
910AB590D12A7019D7AE2DD68213BFBA94CA75DE
```

The fingerprint of the subkey is needed later when we configure a repository for git-crypt.

## Install git-crypt

Being secure is no small matter.
Fortunately, all this hard work has to be done only once and we are now ready to start configuring and using `git-crypt`.

As said, [`git-crypt`](https://github.com/AGWA/git-crypt) is the software we use to handle the automatic encryption of designated files when publishing to a Git repository.
It allows you to maintain files containing sensitive information on the public GitHub environment without the risk of leaking your passwords and other secret information.

> Two important remarks first (we will deal with this soon) to keep in mind:
>
> * Only files created _after_ `git-crypt` is enabled for that file will be encrypted, meaning files already in the repository will not be encrypted until you remove and add them again!
> * To be able to unlock (decrypt) the repository files on another computer (or under another account) you need the unlock key available and added to `git-crypt`.

Since `git-crypt` is not installed by default on Linux based distributions, nor on macOS, we must take care of that first.

<code-group>
  <code-block label="Debian/Ubuntu" active>

```shell
$ sudo apt install git-crypt

$ git-crypt --version
git-crypt 0.6.0
```

  </code-block>
  <code-block label="macOS">

```shell
❯ brew install git-crypt
==> Downloading https://homebrew.bintray.com/bottles/git-crypt-0.6.0_1.arm64_big_sur.bottle.tar.gz
==> Pouring git-crypt-0.6.0_1.arm64_big_sur.bottle.tar.gz
🍺  /opt/homebrew/Cellar/git-crypt/0.6.0_1: 9 files, 305KB

❯ git-crypt --version
git-crypt 0.6.0
```

  </code-block>
</code-group>

We are now ready to create a repository and use `git-crypt` to keep our secrets safe.

## Test git-crypt

Let's put `git-crypt` to the test.
Create a local repository directory - let's call it `crypt-test` - and initialize it for use with Git and `git-crypt`.
A symmetric key for encrypting files is created and saved in `~/crypt-test/.git/git-crypt/keys/default`.

```shell
❯ mkdir ~/crypt-test
❯ cd ~/crypt-test

❯ git init
Initialized empty Git repository in /Users/me/crypt-test/.git/

❯ git-crypt init
Generating key...
```

Create a new repository on GitHub without any files in it that will become the remote repository and point the remote location of the local repository to it.

```shell
❯ git branch -M main
❯ git remote add origin git@github.com:github-user/crypt-test.git
❯ git remote -v
origin  git@github.com:github-user/crypt-test.git (fetch)
origin  git@github.com:github-user/crypt-test.git (push)
```

## Use git-crypt

### Set up the local directory

To ensure the access rights for user, group and world are correct for all files and directories crreated, we must configure the directory with the correct access rights.
Create the repository root directory and install the `setfacl` command:

```bash
$ sudo mkdir -p /path/to/repository
$ sudo chown -R someone:someone /path/to/repository
$ chmod g+s /path/to/repository
$ sudo apt install acl
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following NEW packages will be installed:
  acl
0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
Need to get 60.3 kB of archives.
After this operation, 211 kB of additional disk space will be used.
Get:1 http://debian-archive.trafficmanager.net/debian buster/main amd64 acl amd64 2.2.53-4 [60.3 kB]
Fetched 60.3 kB in 0s (637 kB/s)
Selecting previously unselected package acl.
(Reading database ... 61441 files and directories currently installed.)
Preparing to unpack .../acl_2.2.53-4_amd64.deb ...
Unpacking acl (2.2.53-4) ...
Setting up acl (2.2.53-4) ...
```
Next, set the default user, group and world ownership with ACL's as desired:

```bash
$ setfacl -R -m u:someone:rwx /path/to/repository
$ setfacl -R -m g:someone:rwx /path/to/repository
$ setfacl -R -m o::rx /path/to/repository
$ setfacl -d -m u:someone:rwx /path/to/repository
$ setfacl -d -m g:someone:rwx /path/to/repository
$ setfacl -d -m o::rx /path/to/repository
$ getfacl /path/to/repository
getfacl: Removing leading '/' from absolute path names
# file: path/to/repository
# owner: someone
# group: someone
# flags: -s-
user::rwx
user:someone:rwx
group::rwx
group:someone:rwx
mask::rwx
other::r-x
default:user::rwx
default:user:someone:rwx
default:group::rwx
default:group:someone:rwx
default:mask::rwx
default:other::r-x
```

_Note: if you use `chmod` after this, the ACL becomes invalid!_

Initialize the local repository:

```bash
$ cd /path/to/repository
$ git init
Initialized empty Git repository in /path/to/.git/
```
Create an _empty_ repository on GitHub.
Add some files to the local repository, commit and push them.

```bash
$ echo "# openhab-conf" >> README.md
$ git add README.md
$ git commit -m "First commit"
[master (root-commit) 694ea4f] First commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
$ git remote add origin <REMOTE_REPOSITORY>
$ git remote -v
origin  git@github.com:<GITUSER>/<REPOSITORY>.git (fetch)
origin  git@github.com:<GITUSER>/<REPOSITORY>.git (push)
$ git push -u origin master
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Writing objects: 100% (3/3), 225 bytes | 225.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To github.com:<GITUSER>/<REPOSITORY>.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

We are now ready to setup the encryption for the repository.

### Enable encryption on the repository

Initialize git-crypt for this repository:

```bash
$ git-crypt init
Generating key...
$ touch .gitattributes
```

In `.gitattributes` you specify the future (!) files that must be encrypted.
Be aware that git-crypt will _not_ encrypt files that are already in the repository.
The `.gitattributes` file uses the same syntax for specifying files and directories to encrypt as the `.gitignore` file.
Entries look like this:

```ini
<files-to-encrypt> filter=git-crypt diff=git-crypt
```

So far we have no key to unlock the crypt on another computer or by someone else that collaborates with us, so let's fix that.

### Add the GnuPG subkey to git-crypt

When GnuPG was configured, we created a subkey to use with `git-crypt`, so we can directly add it to the GnuPG vault.
Use the short _key id_ of the previously generated subkey.

> Note that an auto-generated commit is applied, which should be pushed to GitHub.
> Also, don't forget to replace any key_id or fingerprint mentioned in this example with your own values.

```shell
❯ git-crypt add-gpg-user 910AB590D12A7019D7AE2DD68213BFBA94CA75DE
[master (root-commit) 8279faf] Add 1 git-crypt collaborator
 2 files changed, 4 insertions(+)
 create mode 100644 .git-crypt/.gitattributes
 create mode 100644 .git-crypt/keys/default/0/F806033A4E362927630AC23C2F80A75D623F82CD.gpg

❯ git log
commit 8279faf18f1931f3f9e656cb80f8fdf4d82cd501 (HEAD -> master)
Author: Ron Moerman <ron@crazyelectron.io>
Date:   Thu Feb 11 07:11:29 2021 +0100

    Add 1 git-crypt collaborator

    New collaborators:

            623F82CD YOUR NAME <me@example.com>
(END) q
```

GnuPG keys for `git-crypt` of the test repository are stored in `~/crypt-test/.git-crypt/keys/default`.
Before adding files to encrypt, make sure the repository is unlocked with the following command and enter the passphrase.

```shell
❯ git-crypt unlock
```

Just like the `.git` directory, we want to exclude it from the [Visual Studio Code](https://code.visualstudio.com/) Explorer view.
You use VS Code as well, right?
Add the following to your VSCode settings:

```json
"files.exclude": {
     "**/.git": true,
     "**/.git-crypt": true
}
```

### Define files to encrypt

First, create _and commit_ a default `.gitattributes` file that specifies _future_ repository files to encrypt.
You can already add usual suspects to this file, like key files with the `.key` extension and all files in a subdirectory named `secret` for instance.
Make it a habit to store files you want to keep away from prying eyes in a specific directory if the tool allows it.
The `.gitattributes` file should look like this:

```ini
# Specify files to encrypt using git-crypt

# Encrypt any key file
*.key filter=git-crypt diff=git-crypt

# Secret files folder
secrets/**/* filter=git-crypt diff=git-crypt

# Never encrypt .gitattributes (keep as last line!)
.gitattributes !filter !diff
```

Notice that the syntax for specifing file and folder patterns is the same as for files specified in `.gitignore`:

```ini
files-to-encrypt filter=git-crypt diff=git-crypt
```

The `.gitattributes` file we just created is used to specify _future_ repository files to encrypt.
Commit the file to the local repository and push the `git-crypt` commits to the remote repository.

```shell
❯ git add .gitattributes

❯ git-crypt status
not encrypted: .git-crypt/.gitattributes
not encrypted: .git-crypt/keys/default/0/F806033A4E362927630AC23C2F80A75D623F82CD.gpg
not encrypted: .gitattributes
not encrypted: .vscode/settings.json
❯ git commit -s -m "Initialize git-crypt"
master fde31aa] Initialize git-crypt
 2 files changed, 14 insertions(+)
 create mode 100644 .gitattributes
 create mode 100644 .vscode/settings.json

❯ git push -u origin master
Enumerating objects: 13, done.
Counting objects: 100% (13/13), done.
Delta compression using up to 8 threads
Compressing objects: 100% (9/9), done.
Writing objects: 100% (13/13), 1.87 KiB | 1.87 MiB/s, done.
Total 13 (delta 0), reused 0 (delta 0)
To github.com:github-user/crypt-test.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

> REMEMBER: Files that already existed in the repository will not be encrypted after you add them to `.gitattributes`; this must be done _before_ adding (`git add`) them to the repository.

Let's add some files to the local repository: a regular file (README.md) and a secret file to encrypt.
Make sure the secret file is added to `.gitattributes` (and `.gitattributes` commited) if your secret file is not in the example secured directory (`./secrets`).

```shell
❯ echo '# Git-crypt test repository' > README.md

❯ mkdir secrets

❯ echo 'Password = SeCReT!' > secrets/secret.file
```

Now commit the files to the repository and push the commit up to the remote on GitHub.

```shell
❯ git add -A

❯ git status
On branch master
Your branch is up to date with 'origin/master'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
   new file:   README.md
   new file:   secrets/secret.file

❯ git commit -s -m "First commit"
[master 4a83f8b] First commit
 2 files changed, 1 insertion(+)
 create mode 100644 README.md
 create mode 100644 secrets/secret.file

❯ git push
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 8 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (5/5), 496 bytes | 496.00 KiB/s, done.
Total 5 (delta 0), reused 0 (delta 0)
To github.com:cgithub-user/crypt-test.git
   634da55..4a83f8b  master -> master
```

On the Git host (GitHub in our case) we can verify that the designated file is actually encrypted.
Clone the repository to another directory and check if `secrets\secret.file` is encrypted.

```shell
❯ mkdir ~/decrypt-test

❯ cd ~/decrypt-test

❯ git clone git@github.com:github-user/crypt-test.git .
Cloning into '.'...
remote: Enumerating objects: 16, done.
remote: Counting objects: 100% (16/16), done.
remote: Compressing objects: 100% (10/10), done.
Receiving objects: 100% (16/16), done.
Resolving deltas: 100% (1/1), done.
remote: Total 16 (delta 1), reused 15 (delta 0), pack-reused 0

❯ cat secrets/secret.file
GITCRYPT]; ...garbage...
```

The file should contain unreadable text.
Now we will decrypt it and if we check the file again, it will be clear text.

```shell
❯ git-crypt unlock

❯ cat secrets/secret.file
Password = SeCReT!
```

In summary, to add more files to encrypt the steps are:

1. Unlock the vault with `git-crypt unlock`.
2. Add an entry to `.gitattributes` and commit the updated `.gitattributes`.
3. Add the new file to be encrypted to the repository with `git add`.
4. Commit any changes, including the newly created secret file, to the repository.
5. Push the commit up to the remote repository.

## Collaborate on an encrypted repository

As far as the local repository is concerned we're done: the local files are decrypted and when you push the commited changes they will be encrypted on the remote repository.
But we're not completely done yet, as there is no way for others to unlock the vault when they clone the repository with encrypted files.
Other _authorised_ users can clone the repository and decrypt the encrypted files only when their GPG key is added to the `.git-crypt` directory.
Similary, if we clone the repository on another computer, we can only decrypt it if we have our GPG subkey available on that computer.

We already created our `git-crypt` key that can unlock the vault for our local user.
Anyone else who needs access to the repository and access the encrypted files must have their own GPG (sub)key added to `git-crypt`, and thus have created a GPG key for themselves.
They should export it and share their public key and we should import it to our local GPG vault.
Next, you can make it trusted by signing the key.
Finally, add the GPG key to the `git-crypt` vault to allow them to lock and unlock the vault as well.

To explain in more detail how we can do that on Linux as an example, we'll create another user account and share its public key.
First, create a user with `adduser` and generate a GPG primary key and `git-crypt` subkey for that user, just like shown before.
Export that key to a file with the commands shown below.

```shell
$ gpg --list-keys
/home/me/.gnupg/pubring.kbx
-----------------------------
pub   rsa4096 2021-02-11 [C] [expires: 2023-02-11]
      F806033A4E362927630AC23C2F80A75D623F82CD
uid           [ultimate] YOUR NAME <me@example.com>
sub   rsa4096 2021-02-11 [E] [expires: 2022-08-10]

$ gpg --output _public-key-filename_.gpg --armor --export <KEY_ID>
```

Copy the `.gpg` file to the target system where you can import it in the key vault of the user we used to create the Git repository initially, and make it trusted by signing it.

```shell
$ gpg --import /path/to/public-key-file.gpg
gpg: key D71EF1D3147A97DE: public key "OTHER NAME <them@example.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1

$ gpg --list-keys
/Users/me/.gnupg/pubring.kbx
-----------------------------
pub   rsa4096 2021-02-11 [C] [expires: 2024-02-11]
      F806033A4E362927630AC23C2F80A75D623F82CD
uid           [ultimate] YOUR NAME <me@example.com>
sub   rsa4096 2021-02-11 [E] [expires: 2023-02-11]

pub   rsa4096 2021-02-11 [SC] [expires: 2024-02-11]
      8DE79F6E10F53D039A086FA1B41EAA47716C97DE
uid           [ unknown] OTHER NAME <them@domain.net>
sub   rsa4096 2021-02-11 [E] [expires: 2024-02-11]

$ gpg --edit-key 8DE79F6E10F53D039A086FA1B41EAA47716C97DE
gpg (GnuPG) 2.2.27; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

pub  rsa4096/B41EAA47716C97DE
     created: 2021-02-11  expires: 2024-02-11  usage: SC
     trust: unknown       validity: unknown
sub  rsa4096/D71EF1D3147A97DE
     created: 2021-02-11  expires: 2024-02-11  usage: E
[ultimate] (1). THEIR NAME <them@domain.com>

gpg> sign
pub  rsa4096/B41EAA47716C97DE
     created: 2021-02-11  expires: 2024-02-11  usage: SC
     trust: unknown       validity: unknown
 Primary key fingerprint: 8DE7 9F6E 10F5 3D03 9A08  6FA1 B41E AA47 716C 97DE

     THEIR NAME <them@domain.com>

This key is due to expire on 2024-02-11.
Are you sure that you want to sign this key with your
key "YOUR NAME <me@examle.com>" (2F80A75D623F82CD)

Really sign? (y/N) y

gpg> save
```

Make sure the vault is unlocked with `git-crypt unlock`, then add the key to the vault and push the auto-generated commit up to GitHub.

```shell
$ git-crypt add-gpg-user --trusted <KEY_ID> | <EMAIL>
[master 9363310] Add 1 git-crypt collaborator
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 .git-crypt/keys/default/0/8DE79F6E10F53D039A086FA1B41EAA47716C97DE.gpg

$ git add -A

$ git commit -s -m "Added second GPG key"
[master b6d4c0f] Added sauron GPG key
 1 file changed, 148 insertions(+)
 create mode 100644 gitcrypt_pubkey.gpg

$ git push
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (7/7), 1.38 KiB | 1.38 MiB/s, done.
Total 7 (delta 0), reused 0 (delta 0)
To github.com:cgithub-user/crypt-test.git
   fde31aa..9363310  master -> master
```

See also [here](https://medium.com/@sumitkum/securing-your-secret-keys-with-git-crypt-b2fa6ffed1a6)
From now on, the added user can collaborate on the repository and unlock it as needed.

## Safeguard against unencrypted commits

Of course, we have to be sure that files with secrects are not accidentally added unencrypted with `git-crypt`.
We can setup a Git pre-commit hook for this, based on the work of [Falkor](https://gist.github.com/Falkor/848c82daa63710b6c132bb42029b30ef).
From the root of the repository.

```shell
$ mkdir -p config/hooks

$ curl https://gist.githubusercontent.com/Falkor/848c82daa63710b6c132bb42029b30ef/raw/610bac85ca512171d04b19d668098bd2678559a7/pre-commit.git-crypt.sh -o config/hooks/pre-commit.git-crypt.sh
1d04b19d668098bd2678559a7/pre-commit.git-crypt.sh -o config/hooks/pre-commit.git-crypt.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1452  100  1452    0     0   5500      0 --:--:-- --:--:-- --:--:--  5500

$ chmod +x config/hooks/pre-commit.git-crypt.sh

$ git add config/hooks/pre-commit.git-crypt.sh

$ git commit -s -m "pre-commit hook for git-crypt" config/hooks/pre-commit.git-crypt.sh
[master 7273bf4] pre-commit hook for git-crypt
 1 file changed, 33 insertions(+)
 create mode 100755 config/hooks/pre-commit.git-crypt.sh

$ ln -s ../../config/hooks/pre-commit.git-crypt.sh .git/hooks/pre-commit
```

The current version of the script has two issues (at least on macOS): it has a typo and a Git command that is not supported.
The corrected versions looks like this:

```bash
################################################################################
# See <https://gist.github.com/Falkor/848c82daa63710b6c132bb42029b30ef>
# Pre-commit hook to avoid accidentally adding unencrypted files with [git-crypt](https://www.agwa.name/projects/git-crypt/)
# Fix to [Issue #45](https://github.com/AGWA/git-crypt/issues/45)
#
# Usage:
#    $> cd /path/to/repository
#    $> git-crypt init
#    $> curl <url/to/this/raw/gist> -o .git/hooks/pre-commit
#    $> chmod +x .git/hooks/pre-commit
#
# Otherwise, you might want to add it as a git submodule, using:
#    $> git submodule add https://gist.github.com/848c82daa63710b6c132bb42029b30ef.git config/hooks/  pre-commit.git-crypt
#    $> cd .git/hooks
#    $> ln -s ../../config/hooks/pre-commit.git-crypt/pre-commit.git-crypt.sh pre-commit
#
if [ -d .git-crypt ]; then
   echo 'Git pre-commit hook running'
   STAGED_FILES=$(git diff --cached --name-status | awk '$1 != "D" { print $2 }' | xargs echo)
   if [ -n "${STAGED_FILES}" ]; then
      git-crypt status ${STAGED_FILES} &>/dev/null
      if [[ $? -ne 0  ]]; then
         git-crypt status -e ${STAGED_FILES}
         echo '/!\ You should have first unlocked your repository BEFORE staging the above file(s)'
         echo '/!\ Proceed now as follows:'
         echo -e "\t git reset -- ${STAGED_FILES}"
         echo -e "\t git-crypt unlock"
         echo -e "\t git add ${STAGED_FILES}"
         exit 1
      fi
   fi
fi
```

We can unlock the vault (meaning decrypt the encryption key using our personnal GPG key) by running `git-crypt unlock`, and lock back by running `git-crypt lock`.

<alert>Using the Git pre-commit hook avoids having sensitive files (as filtered within the `.gitattributes` file) commited in cleartext while the vault is locked.</alert>

### Finishing/Testing

Finally, log out and back in (or reboot). launchd will load the service automatically - no need to use `launchctl load`, etc.

To test, simply run `ssh-add -l`. This will activate your locally registered `com.openssh.ssh-agent-local` without activating the system one as your shell will have detected and copied the socket listner location from `SSH_AUTH_SOCK_LOCAL` to `SSH_AUTH_SOCK`.

You can verify this by running `ps aux | grep ssh-agent`. The only running instance you should see is `/usr/bin/ssh-agent -l -t 14400`. Additionally, `launchctl list | grep ssh-agent` should show a PID for `com.openssh.ssh-agent-local` and not `com.openssh.ssh-agent`:

```
$ launchctl list | grep ssh-agent
-	0	com.openssh.ssh-agent
12345	0	com.openssh.ssh-agent-local
```

## (Optional) Modifying SSH

You can run SSH Agent w/Modified Options (MacOS Big Sur, No Homebrew, No SIP Modification).
The following will show you how you can modify the startup options of the SSH agent supplied by macOS in a non-invasive way. This can be useful for doing things like setting a key lifetime, which can then be used with `AddKeysToAgent` in your `~/.ssh/config` to automate the timing out of saved keys. This ensures that your passphrase is re-asked for periodically without having to shutdown, re-log, or having it actually persisted in keychain, the latter being almost as bad as having no passphrase at all, given that simply being logged in is generally enough to then use the key.

This method does *not* modify the system-installed SSH agent service (`com.openssh.ssh-agent`), but rather duplicates its functionality into a user-installed launch agent where we can then modify the options. Modifying the system-installed service is becoming increasingly harder to do; [SIP](https://support.apple.com/en-us/HT204899) generally protects the files you need to modify, in addition to certain system volumes being mounted read-only now. This is generally a good thing for application and system security and should not be messed with if you don't have to. Additionally, the [Homebrew](https://brew.sh/) `openssh` package has issues in that you possibly lose out in the modifications that Apple has made to allow the SSH agent to work seamlessly with socket activation - YMMV, but I have had issues getting it to work as it seems to expect to have access to create the socket, causing conflicts when attempting to start the agent.

### Copying the plist

```
mkdir ~/Library/LaunchAgents
cp /System/Library/LaunchAgents/com.openssh.ssh-agent.plist ~/Library/LaunchAgents/com.openssh.ssh-agent-local.plist
```

After you do this, open the file with your favorite text editor of choice and replace:
* `com.openssh.ssh-agent` with `com.openssh.ssh-agent-local`
* `SSH_AUTH_SOCK` with `SSH_AUTH_SOCK_LOCAL`

Then, add in some options you want for the local agent (as additional `string` tags in the `ProgramArguments` array). A good example is `-t 14400` to time out loaded keys after 4 hours.

Here's a copy of the modified plist file:

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.openssh.ssh-agent-local</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/bin/ssh-agent</string>
		<string>-l</string>
		<string>-t</string>
		<string>14400</string>
	</array>
	<key>Sockets</key>
	<dict>
		<key>Listeners</key>
		<dict>
			<key>SecureSocketWithKey</key>
			<string>SSH_AUTH_SOCK_LOCAL</string>
		</dict>
	</dict>
	<key>EnableTransactions</key>
	<true/>
</dict>
</plist>
```

### Shell Modifications

Next, add this to your shell profie (ie: `.zprofile` or `.bash_profile`):

```
if [ -n "${SSH_AUTH_SOCK_LOCAL}" ]; then
  export SSH_AUTH_SOCK="${SSH_AUTH_SOCK_LOCAL}"
fi
```

## Conclusion

Although the initial setup requires some effort, once it is setup it is mostly automated, except for adjusting `.gitattributes` for new directories, files or file patterns.
