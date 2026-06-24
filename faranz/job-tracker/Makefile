PY ?= python

.PHONY: up install run

up: install run

install:
	$(PY) -m pip install -r requirements.txt

run:
	$(PY) app.py
