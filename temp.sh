#!/bin/bash
git pull beajer test/ci
git add .travis.yml
git commit -m "ci: test $1"
git push beajer test/ci