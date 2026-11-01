const { spawn } = require("child_process");
const http = require("http");

async function main() {
  console.log("Launching headless Chrome...");
  const chrome = spawn("/usr/bin/google-chrome", [
    "--headless=new",
    "--remote-debugging-port=9333",
    "--remote-debugging-address=127.0.0.1",
    "--user-data-dir=/tmp/chrome-test-profile",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-gpu"
  ]);

  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      await new Promise((res, rej) => {
        const req = http.get("http://127.0.0.1:9333/json/version", (resStream) => {
          if (resStream.statusCode === 200) {
            ready = true;
            res();
          } else rej();
        });
        req.on("error", rej);
      });
      if (ready) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (!ready) {
    console.error("Chrome failed to start");
    chrome.kill();
    process.exit(1);
  }
  console.log("Chrome CDP is ready on port 9333");

  const newPageTarget = await new Promise((res, rej) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port: 9333,
      path: "/json/new",
      method: "PUT"
    }, (r) => {
      let data = "";
      r.on("data", chunk => data += chunk);
      r.on("end", () => res(JSON.parse(data)));
    });
    req.on("error", rej);
    req.end();
  });

  const wsUrl = newPageTarget.webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener("message", handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const errors = [];
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push({ type: "exception", text: msg.params.exceptionDetails?.text, desc: msg.params.exceptionDetails?.exception?.description });
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      errors.push({ type: "console.error", text: msg.params.args.map(a => a.value || a.description).join(" ") });
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");

  const urlsToTest = [
    "http://localhost:3000/",
    "http://localhost:3000/category/developer-tools/",
    "http://localhost:3000/category/document-tools/",
    "http://localhost:3000/category/business-tools/",
    "http://localhost:3000/category/productivity/",
    "http://localhost:3000/tools/pdf-to-jpg/",
    "http://localhost:3000/tools/pdf-to-png/",
    "http://localhost:3000/tools/pdf-to-word/",
    "http://localhost:3000/tools/pdf-to-excel/",
    "http://localhost:3000/tools/pdf-to-ppt/",
    "http://localhost:3000/tools/pdf-reader/",
    "http://localhost:3000/tools/pdf-organizer/",
    "http://localhost:3000/tools/pdf-merger/",
    "http://localhost:3000/tools/pdf-splitter/",
    "http://localhost:3000/tools/pdf-compress/",
    "http://localhost:3000/tools/pdf-ocr/",
    "http://localhost:3000/tools/pdf-scanner/",
    "http://localhost:3000/tools/word-to-pdf/",
    "http://localhost:3000/tools/excel-to-pdf/",
    "http://localhost:3000/tools/ppt-to-pdf/",
    "http://localhost:3000/tools/gst-calculator/",
    "http://localhost:3000/tools/qr-code-generator/",
    "http://localhost:3000/tools/json-formatter/",
    "http://localhost:3000/tools/base64-tool/"
  ];

  let passed = 0;
  for (const url of urlsToTest) {
    const startErrorCount = errors.length;
    process.stdout.write(`Testing ${url} ... `);
    await send("Page.navigate", { url });
    await new Promise(r => setTimeout(r, 1200));
    
    const evalRes = await send("Runtime.evaluate", { expression: "document.title" });
    const title = evalRes?.result?.value || "no title";
    
    const bodyTextRes = await send("Runtime.evaluate", { expression: "document.body.innerText.length" });
    const textLen = bodyTextRes?.result?.value || 0;

    const newErrors = errors.slice(startErrorCount).filter(e => {
      const str = (e.text || "") + " " + (e.desc || "");
      if (str.includes("favicon.ico")) return false;
      return true;
    });

    if (newErrors.length === 0 && textLen > 50) {
      console.log(`✓ OK (${textLen} chars, "${title}")`);
      passed++;
    } else {
      console.log(`✗ Issues encountered: textLen=${textLen}, errors=`, newErrors);
    }
  }

  console.log(`\n========================================`);
  console.log(`Final Result: ${passed}/${urlsToTest.length} pages passed with ZERO browser errors!`);
  console.log(`========================================\n`);

  ws.close();
  chrome.kill();
  process.exit(passed === urlsToTest.length ? 0 : 1);
}

main().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
