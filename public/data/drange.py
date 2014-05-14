#!/usr/bin/env python

import sys
import datetime

yesterday = (datetime.datetime.today() - datetime.timedelta(days=1))
opening_date = datetime.datetime(2014, 03, 30)

if len(sys.argv) > 1:
    opening_date = datetime.datetime.strptime(sys.argv[1], "%Y-%m-%d")
days = (yesterday - opening_date).days

for x in range(0, days+1):
    print (yesterday - datetime.timedelta(days=x)).strftime("%Y-%m-%d")

