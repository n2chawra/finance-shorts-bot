"""One-off check (branch only): the Gemini key works, the free tier answers, and it can watch a public YouTube Short."""
import json, os, sys, urllib.request, urllib.error

KEY = os.environ.get("GEMINI_API_KEY", "")
BASE = "https://generativelanguage.googleapis.com/v1beta"
VIDEO = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=p2Q4_cM-_40"

def call(path, body=None):
    req = urllib.request.Request(f"{BASE}/{path}", data=json.dumps(body).encode() if body else None,
                                 headers={"content-type": "application/json", "x-goog-api-key": KEY})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:600]

if not KEY:
    sys.exit("GEMINI_API_KEY is not set")
print("key present, length", len(KEY))
code, models = call("models?pageSize=200")
print("list models:", code)
if code != 200:
    sys.exit(models)
names = [m["name"].split("/")[-1] for m in models["models"] if "generateContent" in m.get("supportedGenerationMethods", [])]
print("models:", ", ".join(names))
import time
PREFER = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"]
order = [m for m in PREFER if m in names]
prompt = ("Watch this YouTube Short. For each second from 0:00 to 0:05, say in one line what is on screen "
          "(characters, objects, any text exactly as shown) and what the narrator says. Then give the total length.")
for model in order:
  for attempt in range(3):
    code, out = call(f"models/{model}:generateContent", {"contents": [{"parts": [
        {"file_data": {"file_uri": VIDEO}}, {"text": prompt}]}]})
    if code != 503: break
    time.sleep(20)
  if True:
    print(f"\n=== {model}: HTTP {code}")
    if code == 200:
        print(out["candidates"][0]["content"]["parts"][0]["text"])
        print("usage:", json.dumps(out.get("usageMetadata")))
        break
    print(str(out)[:400])
