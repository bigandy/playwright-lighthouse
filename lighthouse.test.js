require("dotenv").config();
const BASE_URL = "https://truenorth.io";
const assert = require("chai").assert;
const lighthouse = require("lighthouse");
const playwright = require("playwright");

const { query } = require("./utils/hasura");

const slackUrl = process.env.SLACK_URL;

var Slack = require("slack-node");
slack = new Slack();
slack.setWebhook(slackUrl);

const showNotifications = true;
const saveToHasura = true;

const limits = {
  ttfb: 600,
  fcp: 4000,
};

const PORT = 9222;

const postNotificationToSlack = (url, stats) => {
  const { ttfb, fcp, layoutShift, categories } = stats;

  let color = "#f00";

  if (ttfb <= limits.ttfb && fcp <= limits.fcp) {
    color = "#0f0";
  }

  console.log({ url, color, ttfb, fcp, layoutShift, limits });

  slack.webhook(
    {
      channel: "#website-performance",
      username: "Perf Bot",
      icon_emoji:
        "https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2018-08-15/418391369270_9cc899bb0fae8df14f75.png",
      attachments: [
        {
          fallback: "Required plain-text summary of the attachment.",
          color: color,
          title: `Perf Test Summary for ${url}`,
          fields: [
            {
              title: "TTFB",
              value: `${ttfb.toFixed(2)}ms`,
              short: false,
            },
            {
              title: "FCP",
              value: `${fcp.toFixed(2)}ms`,
              short: false,
            },
            {
              title: "layoutShift",
              value: `${layoutShift.toFixed(2)}`,
              short: false,
            },
            {
              title: "Lighthouse Perf",
              value: `${(categories.performance.score * 100).toFixed(2)}/100`,
              short: true,
            },
            {
              title: "Lighthouse SEO",
              value: `${(categories.seo.score * 100).toFixed(2)}/100`,
              short: true,
            },
            {
              title: "Lighthouse Best Practices",
              value: `${(categories["best-practices"].score * 100).toFixed(
                2
              )}/100`,
              short: true,
            },
            {
              title: "Lighthouse Accessibility",
              value: `${(categories.accessibility.score * 100).toFixed(2)}/100`,
              short: true,
            },
          ],
        },
      ],
    },
    function (err, response) {
      if (err) {
        console.log("Error sending to Slack: ", err);
      }
    }
  );
};

const runLightHouseAudit = async (url) => {
  const browser = await playwright["chromium"].launch({
    args: [
      `--remote-debugging-port=${PORT}`,
    ] /* Expose this so we can use it below */,
  });

  const lighthouseOpts = {
    port: PORT,
    // disableStorageReset: true /* For the custom steps we will show later */,
    // logLevel: "info" /* To observe the good stuff */,
  };

  const lighthouseResult = await lighthouse(url, lighthouseOpts);
  const { audits, categories } = lighthouseResult.lhr;

  //   console.log({ categories });

  await browser.close();

  return { audits, categories };
};

const statsMutation = `mutation AddOneStat($branch: String! $ttfb: numeric $fcp: numeric $page_name: String! $url: String!) {
    insert_stats_one(object: {branch:$branch, ttfb:$ttfb, fcp: $fcp, page_name: $page_name, url: $url}) {
      branch,
      ttfb
      created_at
      updated_at
      id
      url
      fcp
      page_name
    }
  }
`;

const runTest = async (url) => {
  describe(`${BASE_URL + url} test`, () => {
    console.log("i am test!", url);
    // must be a reason I am doing this. Oh yeah. If the lighthouse test fails then we get the ttfb of one over the limit so the assert will also fail. I think...

    let ttfb = limits.ttfb + 1,
      fcp = limits.fcp + 1,
      layoutShift = 0;

    before(async () => {
      // 1. Run the Audit on the URL.
      const { audits, categories } = await runLightHouseAudit(BASE_URL + url);

      // 2. Grab the section of the data we want.
      fcp = audits["first-contentful-paint"].numericValue;
      ttfb = audits["server-response-time"].numericValue;
      layoutShift = audits["cumulative-layout-shift"].numericValue;

      // 3. Save the data to Hasura

      if (saveToHasura === true) {
        const result = await query({
          query: statsMutation,
          variables: {
            url: BASE_URL + url,
            page_name: url,
            branch: "develop", // AHTODO: GET THIS FROM THE GITHUB ENV somehow
            ttfb,
            fcp,
          },
        });
      }

      // 4. Optional step where we post to Slack
      if (showNotifications === true) {
        const stats = { ttfb, fcp, layoutShift, categories };

        postNotificationToSlack(BASE_URL + url, stats);
      }
    });

    it(`TTFB is below ${limits.ttfb}`, async () => {
      assert.isAtMost(ttfb, limits.ttfb);
    });

    it(`Lighthouse FCP is below ${limits.fcp}`, async () => {
      assert.isAtMost(fcp, limits.fcp);
    });

    // after(function () {
    //   console.log({ ttfb, fcp, url });
    // });
  });
};

const urls = ["/", "/early-access/"];

// Loop the tests
urls.forEach((url) => runTest(url));

// // const runTests = async (urls) => {
// //   try {
// //     await ["/", "/early-access/"]
// //       .reduce((seq, n) => {
// //         console.log({ seq, n });
// //         return seq.then(() => {
// //           console.log(n);
// //           return new Promise(function (res) {
// //             runTest(BASE_URL + n);
// //             return res();
// //           });
// //         });
// //       }, Promise.resolve())
// //       .then(
// //         () => console.log("done"),
// //         (e) => console.log(e)
// //       );
// //     // await urls
// //     //   .reduce((seq, currentUrl) => {
// //     //     console.log({ currentUrl });
// //     //     return seq.then(() => {
// //     //       console.log(currentUrl);
// //     //       return new Promise(
// //     //         async (res) => await runTest(BASE_URL + currentUrl)
// //     //       );
// //     //     });
// //     //   }, Promise.resolve())
// //     //   .then(() => console.log("done"))
// //     //   .catch((e) => console.error(e));
// //   } catch (error) {
// //     console.error(error);
// //   }

// //   //   // try {
// //   //   //   return await urls.reduce(async (promiseChain, currentUrl) => {
// //   //   //     return await promiseChain().then(() => runTest(BASE_URL + currentUrl));
// //   //   //   }, Promise.resolve());
// //   //   // } catch (error) {
// //   //   //   console.error("Error running the tests", error);
// //   //   // }
// //   //   // return urls
// //   //   //   .reduce((p, url) => {
// //   //   //     return p.then(async () => await runTest(BASE_URL + url));
// //   //   //   }, Promise.resolve())
// //   //   //   .then(() => {
// //   //   //     console.log(`All Processed ${urls.length} processed`);
// //   //   //   })
// //   //   //   .catch((e) => console.error(e));
// // };

// // runTests(urls);

// // async () => await runTests(urls);
