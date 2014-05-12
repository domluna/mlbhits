#!/usr/bin/env python

import sys
import datetime

today = datetime.datetime.today()
opening_date = datetime.datetime(2014, 03, 30)

if len(sys.argv) > 1:
    opening_date = datetime.datetime.strptime(sys.argv[1], "%Y-%m-%d")
days = (today - opening_date).days

for x in range(0, days+1):
    print (today - datetime.timedelta(days=x)).strftime("%Y-%m-%d")

