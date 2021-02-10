const url = "https://demo.truenorth.io";

const lighthouse = require("lighthouse");
const playwright = require("playwright");

// describe("audit example", () => {
// it("open browser", async () => {
(async () => {
  const PORT = 9222; /* Not arbitrary, the default Lighthouse would look for if not specified in options */

  const browser = await playwright["chromium"].launch({
    args: [
      `--remote-debugging-port=${PORT}`,
    ] /* Expose this so we can use it below */,
  });

  const lighthouseOpts = {
    port: PORT,
    disableStorageReset: true /* For the custom steps we will show later */,
    logLevel: "info" /* To observe the good stuff */,
  };

  /* Run Lighthouse, using the options specified */
  const lighthouseResult = await lighthouse(url, lighthouseOpts);
  const { audits } = lighthouseResult.lhr;

  const ttfb = audits["server-response-time"];
  const fcp = audits["first-contentful-paint"];

  console.log(
    fcp,
    ttfb
  ); /* Inspect the "lhr" (lighthouse report) property in the console */

  /* Kill the browser 🔪 */
  await browser.close();
})();
// });
