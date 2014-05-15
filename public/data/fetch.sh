#!/bin/bash

for current_date in $(./drange.py)
  do
    echo "Scraping day ${current_date}"
    for i in $(mlb games --date "${current_date}" | cut -f 1)
      do
        echo "    Scraping game #${i}..."
        mlb game --date "$current_date" --hits "${i}" >> hits.tsv
      done
  done
