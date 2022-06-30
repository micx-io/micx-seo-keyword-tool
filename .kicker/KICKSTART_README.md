# This project is build upon infracamp's kickstart
> Version statement v1.2 (2021-10-18) - find a newer version or suggest changes in
> (https://github.com/nfra-project/kickstart-skel/_common/)

Kickstart is a open-source project developed by Matthias Leuffen (m@tth.es), to 
provide a tool- and platform- agnostic tool for microservice development organisations
and an easy way to onboard new members into collaborative code ownership organisations.
At the moment, kickstart depends on docker. But this might change over time.

- [Visit infracamp.org Homepage](https://infracamp.org)
- [Getting started guilde](https://nfra.infracamp.org)
- [Where does this information come from? Link to skel_project](https://github.com/nfra-project/kickstart-skel)

## Short documentation

To run this project on your local pc for development, you need
***Linux, MacOS*** or ***Windows10 with WSL2*** with [cURL](https://en.wikipedia.org/wiki/CURL)
and [docker](https://en.wikipedia.org/wiki/Docker_(software)).
See the [Getting started guilde](https://nfra.infracamp.org) for
detailed setup instructions.

Open the command-line and run

```
./kickstart.sh
```

in the projects main directory. [Link to file](../kickstart.sh)

The project should start automatically - You can start developing!

## What are all these files for?

### `.kick.yml`

The main configuration file. The `from:` line right on the top
of the file indicates, which docker container to load for development
(so, if you call `./kickstart.sh`)

### `.kickstartconfig` - Optional

This file is red by `./kickstart.sh`. Before it reads it, it will
crawl for an equal file the users home directory `~/.kickstartconfig`
which can be used to define properties for all your projects like
special mount points, etc.

### `.kicker/conf/` - Template  

These files are copied to the dedicated location on the image during
initialization. So here you can configure the container.

### `.kick-stack.yml` - Optional: Compose file for additional services


