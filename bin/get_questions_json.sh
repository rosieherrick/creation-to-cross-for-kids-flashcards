#!/usr/bin/env bash

# change directory to the project root
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." || exit 1

mkdir -p lessons \
 && bin/build-flashcards-content.mjs > lessons/questions.json \
 && npx prettier -w lessons/questions.json
