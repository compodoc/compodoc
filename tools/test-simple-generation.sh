#!/bin/bash

TEST_FOLDER='test-simple-generation'

rm -rf node_modules

rm -rf $TEST_FOLDER

mkdir $TEST_FOLDER

cp -r './test/src/todomvc-ng2/' $TEST_FOLDER

cd $TEST_FOLDER

npm i

npm run doc
