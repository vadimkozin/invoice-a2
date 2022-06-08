#!/bin/bash
YEAR=2022
MONTH=05

node ./index.js -aics -f ./sources/${YEAR}/westcall-longdistance-${YEAR}-${MONTH}.xls
node ./index.js -aics -f ./sources/${YEAR}/westcall-intrazone-${YEAR}-${MONTH}.xls