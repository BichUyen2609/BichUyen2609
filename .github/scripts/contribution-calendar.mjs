import { mkdir, writeFile } from "node:fs/promises";

const { GITHUB_REPOSITORY_OWNER: login, GITHUB_TOKEN: token } = process.env;
const query = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      followers { totalCount }
      repositories(first: 100, after: $after, privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
        nodes { stargazerCount }
        pageInfo { hasNextPage endCursor }
      }
      contributionsCollection {
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              weekday
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

async function fetchProfile(after = null) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login, after } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub profile query returned HTTP ${response.status}`);
  }
  const { data, errors } = await response.json();
  if (errors?.length || !data?.user) {
    throw new Error(errors?.map(({ message }) => message).join(", ") || "Missing GitHub profile");
  }
  return data.user;
}

const user = await fetchProfile();
const { contributionCalendar: calendar, totalPullRequestContributions } = user.contributionsCollection;
let stars = 0;
let currentPage = user.repositories;
while (true) {
  stars += currentPage.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);
  if (!currentPage.pageInfo.hasNextPage) break;
  currentPage = (await fetchProfile(currentPage.pageInfo.endCursor)).repositories;
}

const levelColors = {
  NONE: "#1d304b",
  FIRST_QUARTILE: "#284f9a",
  SECOND_QUARTILE: "#3477d8",
  THIRD_QUARTILE: "#54a4fa",
  FOURTH_QUARTILE: "#a9dcff",
};
const gridX = 39;
const gridY = 61;
const step = 10;
const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const total = calendar.totalContributions.toLocaleString("en-US");
const monthLabels = [];
const squares = [];
let previousMonth;

for (const [weekIndex, { contributionDays }] of calendar.weeks.entries()) {
  const x = gridX + weekIndex * step;
  const month = contributionDays[0].date.slice(0, 7);
  if (month !== previousMonth) {
    const label = monthFormat.format(new Date(contributionDays[0].date));
    monthLabels.push(`<text x="${x}" y="53">${label}</text>`);
    previousMonth = month;
  }

  for (const day of contributionDays) {
    const y = gridY + day.weekday * step;
    squares.push(`<rect x="${x}" y="${y}" width="8" height="8" rx="2" fill="${levelColors[day.contributionLevel]}"/>`);
  }
}

const legend = Object.values(levelColors).map((color, index) =>
  `<rect x="${496 + index * 10}" y="146" width="8" height="8" rx="2" fill="${color}"/>`
);

function svg(title, width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="caption">
  <title id="caption">${title}</title>
  <defs>
    <linearGradient id="activity-panel" x2=".92" y2="1">
      <stop stop-color="#101e3b"/>
      <stop offset=".52" stop-color="#091326"/>
      <stop offset="1" stop-color="#070f20"/>
    </linearGradient>
  </defs>
  <g font-family="system-ui,Segoe UI,sans-serif">
    ${body}
  </g>
</svg>
`;
}

const panelHeight = 171;
function frame(width, title, end) {
  return `<rect x=".5" y=".5" width="${width - 1}" height="${panelHeight - 1}" rx="17" fill="url(#activity-panel)" stroke="#264b7d"/>
  <path d="M18 27V17h4v10m3 0V12h4v15m3 0v-7h4v7" fill="#7bc6ff"/>
  <text x="50" y="28" font-size="17" font-weight="750" letter-spacing=".45" fill="#d6eaff">${title}</text>
  <text x="${end}" y="28" font-family="monospace" font-size="16" fill="#59beff">///</text>
  <path d="M${end + 34} 22H${width - 18}" stroke="#274c80"/>`;
}

const calendarBody = frame(700, "CONTRIBUTION GRAPH", 250) + `
  <g font-family="system-ui,sans-serif" font-size="10" fill="#b7cbed">
    ${monthLabels.join("\n    ")}
    <text x="12" y="78">Mon</text>
    <text x="12" y="98">Wed</text>
    <text x="12" y="118">Fri</text>
    <text x="470" y="154">Less</text>
    <text x="550" y="154">More</text>
  </g>
  <g>${squares.join("")}</g>
  <g>${legend.join("")}</g>
  <path d="M583 46v106" stroke="#304664"/>
  <g text-anchor="middle">
    <text x="641" y="73" fill="#d6e4f9" font-size="11">Contributions</text>
    <text x="641" y="104" fill="#a9dcff" font-size="25" font-weight="700">${total}</text>
    <text x="641" y="123" fill="#b7cbed" font-size="11">Past year</text>
  </g>`;

const statsWidth = 552;
const metrics = [
  ["Repositories", user.repositories.totalCount, "▣"],
  ["Followers", user.followers.totalCount, "◉"],
  ["Stars", stars, "★"],
  ["Pull Requests", totalPullRequestContributions, "⑂"],
];
const statsBody = frame(statsWidth, "GITHUB STATS", 183) + metrics.map(([label, number, symbol], index) => {
  const x = 16 + index * 133;
  const center = x + 60;
  return `<rect x="${x}" y="45" width="121" height="107" rx="12" fill="#101d3a" stroke="#2b4c84"/>
    <text x="${center}" y="79" text-anchor="middle" fill="#8fc9ff" font-size="24">${symbol}</text>
    <text x="${center}" y="110" text-anchor="middle" fill="#e1efff" font-size="21" font-weight="750">${number.toLocaleString("en-US")}</text>
    <text x="${center}" y="134" text-anchor="middle" fill="#bbd2f2" font-size="12">${label}</text>`;
}).join("\n  ");
const activityCaption = `GitHub activity. ${metrics.map(([label, number]) => `${label}: ${number}`).join(". ")}. ${total} contributions in the past year.`;
const statsWidthOnMobile = 700 / statsWidth;
const stackedHeight = Math.ceil(panelHeight * statsWidthOnMobile) + 12;

await mkdir("dist", { recursive: true });
await Promise.all([
  writeFile("dist/contribution-calendar.svg", svg(`${total} GitHub contributions in the past year`, 700, panelHeight, calendarBody)),
  writeFile("dist/profile-activity.svg", svg(activityCaption, statsWidth + 712, panelHeight, `
    ${statsBody}
    <g transform="translate(${statsWidth + 12})">${calendarBody}</g>`)),
  writeFile("dist/profile-activity-mobile.svg", svg(activityCaption, 700, stackedHeight + panelHeight, `
    <g transform="scale(${statsWidthOnMobile})">${statsBody}</g>
    <g transform="translate(0 ${stackedHeight})">${calendarBody}</g>`)),
]);
