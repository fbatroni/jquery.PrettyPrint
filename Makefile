SHELL = /bin/bash
ROOT = $(shell pwd)


bootstrap:
	apt-get update
	apt-get install --assume-yes freetds-dev libxml2 libxml2-dev libxslt1-dev

install: bootstrap