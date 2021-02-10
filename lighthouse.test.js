const BASE_URL = "https://truenorth.io";
const assert = require("chai").assert;
const lighthouse = require("lighthouse");
const playwright = require("playwright");

const slackUrl = process.env.SLACK_URL;

console.log(slackUrl);
// var Slack = require("slack-node");
// slack = new Slack();
// slack.setWebhook(slackUrl);

// const showNotifications = true;

// const limits = {
//   ttfb: 600,
//   fcp: 3000,
// };

// const PORT = 9222;

// const runTest = (url) => {
//   describe(`${url} test`, () => {
//     let ttfb = limits.ttfb + 1,
//       fcp = limits.fcp + 1;

//     before(async () => {
//       const browser = await playwright["chromium"].launch({
//         args: [
//           `--remote-debugging-port=${PORT}`,
//         ] /* Expose this so we can use it below */,
//       });

//       const lighthouseOpts = {
//         port: PORT,
//         // disableStorageReset: true /* For the custom steps we will show later */,
//         // logLevel: "info" /* To observe the good stuff */,
//       };

//       const lighthouseResult = await lighthouse(url, lighthouseOpts);
//       const { audits, categories } = lighthouseResult.lhr;
//       fcp = audits["first-contentful-paint"].numericValue;
//       ttfb = audits["server-response-time"].numericValue;
//       layoutShift = audits["cumulative-layout-shift"].numericValue;

//       console.log({ categories });

//       await browser.close();

//       var color = "";
//       if (ttfb <= limits.ttfb && fcp <= limits.fcp) {
//         color = "#0f0";
//       } else {
//         color = "#f00";
//       }

//       if (showNotifications === true) {
//         slack.webhook(
//           {
//             channel: "#website-performance",
//             username: "Perf Bot",
//             icon_emoji:
//               "https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2018-08-15/418391369270_9cc899bb0fae8df14f75.png",
//             attachments: [
//               {
//                 fallback: "Required plain-text summary of the attachment.",
//                 color: color,
//                 title: `Perf Test Summary for ${url}`,
//                 fields: [
//                   {
//                     title: "TTFB",
//                     value: `${ttfb.toFixed(2)}ms`,
//                     short: false,
//                   },
//                   {
//                     title: "FCP",
//                     value: `${fcp.toFixed(2)}ms`,
//                     short: false,
//                   },
//                   {
//                     title: "layoutShift",
//                     value: `${layoutShift.toFixed(2)}`,
//                     short: false,
//                   },
//                   {
//                     title: "Lighthouse Perf",
//                     value: `${(categories.performance.score * 100).toFixed(
//                       2
//                     )}/100`,
//                     short: true,
//                   },
//                   {
//                     title: "Lighthouse SEO",
//                     value: `${(categories.seo.score * 100).toFixed(2)}/100`,
//                     short: true,
//                   },
//                   {
//                     title: "Lighthouse Best Practices",
//                     value: `${(
//                       categories["best-practices"].score * 100
//                     ).toFixed(2)}/100`,
//                     short: true,
//                   },
//                 ],
//               },
//             ],
//           },
//           function (err, response) {
//             if (err) {
//               console.log("Error sending to Slack: ", err);
//             }
//           }
//         );
//       }
//     });

//     it(`TTFB is below ${limits.ttfb}`, async () => {
//       assert.isAtMost(ttfb, limits.ttfb);
//     });

//     it(`Lighthouse FCP is below ${limits.fcp}`, async () => {
//       assert.isAtMost(fcp, limits.fcp);
//     });
//   });
// };

// const urls = ["/", "/early-access/"];

// const runTests = async (urls) => {
//   return urls
//     .reduce((p, url) => {
//       return p.then(async () => await runTest(BASE_URL + url));
//     }, Promise.resolve())
//     .then(() => {
//       console.log(`All Processed ${urls.length} processed`);
//     })
//     .catch((e) => console.error(e));
// };

// runTests(urls);
