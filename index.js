const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");

async function main() {
  let count = 0;
  const logDir = path.join(__dirname, "log");

  const files = await fs.promises.readdir(logDir);
  for (const file of files) {
    await fs.promises.unlink(path.join(logDir, file));
  }

  http
    .createServer((request, response) => {
      const requestPath = decodeURI(url.parse(request.url).path.slice(1));

      const buffer = [];
      request.on("data", data => buffer.push(data));
      request.on("end", async () => {
        count += 1;

        const countText = String(count).padStart(3, 0);
        const fileName = `${countText} - ${requestPath}.json`;
        const filePath = path.join(logDir, fileName);
        let data;
        try {
          const body = JSON.parse(Buffer.concat(buffer).toString());
          data = JSON.stringify(body, null, 2);
        } catch (error) {
          data = "{}";
        }

        await fs.promises.writeFile(filePath, data);
      });

      console.log(requestPath);
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("OK");
    })
    .listen(3000);
}

main().catch(console.error);
