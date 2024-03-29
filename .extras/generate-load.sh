#!/bin/bash
# Set title
echo -ne "\033]0;generate-load\007"

# Infinite loop
index=1
while true; do
  case $((index % 10)) in
    2)
      id=20
      ;;
    3)
      id=30
      ;;
    5)
      id=40
      ;;
    7)
      id=50
      ;;
    *)
      id=1
      ;;
  esac

  echo "id=$id"
  url="https://localhost:3000/rest/$id"

  # Send a GET request to the URL
  curl -k -H "Accept: application/hal+json" "$url" > /dev/null

  # Sleep for 0.3 seconds
  sleep 0.3

  index=$((index + 1))
done