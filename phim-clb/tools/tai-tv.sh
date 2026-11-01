# Tải ảnh gốc TopView: bash tools/tai-tv.sh <tiền tố> < danh sách "<id>/0.png?v=2&verify=…" (mỗi dòng một ảnh) → tam-anh/<tiền tố>1.png, 2.png…
B=https://aigc.topviewai.app/analyzed_video/task/object_replace_llm; i=1
while read -r d; do [ -z "$d" ] && continue
  f="$(dirname "$0")/../tam-anh/$1$i.png"
  for t in 1 2 3; do curl -s -o "$f" -w "$1$i %{http_code}\n" "$B/$d" | grep -q ' 200' && break; done; echo "$1$i"; i=$((i+1)); done
