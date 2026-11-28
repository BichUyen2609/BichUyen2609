import { mkdir, writeFile } from "node:fs/promises";

const { GITHUB_REPOSITORY_OWNER: login, GITHUB_TOKEN: token } = process.env;
const query = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
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

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query, variables: { login } }),
});
if (!response.ok) {
  throw new Error(`GitHub contribution query returned HTTP ${response.status}`);
}

const { data, errors } = await response.json();
const calendar = data?.user?.contributionsCollection?.contributionCalendar;
if (errors?.length || !calendar) {
  throw new Error(errors?.map(({ message }) => message).join(", ") || "Missing contribution calendar");
}

const levelColors = {
  NONE: "#1d304b",
  FIRST_QUARTILE: "#284f9a",
  SECOND_QUARTILE: "#3477d8",
  THIRD_QUARTILE: "#54a4fa",
  FOURTH_QUARTILE: "#a9dcff",
};
const gridX = 39;
const gridY = 50;
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
    monthLabels.push(`<text x="${x}" y="39">${label}</text>`);
    previousMonth = month;
  }

  for (const day of contributionDays) {
    const y = gridY + day.weekday * step;
    squares.push(`<rect x="${x}" y="${y}" width="8" height="8" rx="2" fill="${levelColors[day.contributionLevel]}"/>`);
  }
}

const legend = Object.values(levelColors).map((color, index) =>
  `<rect x="${496 + index * 10}" y="132" width="8" height="8" rx="2" fill="${color}"/>`
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="158" viewBox="0 0 700 158" role="img" aria-labelledby="caption">
  <title id="caption">${total} GitHub contributions in the past year</title>
  <rect x="0.5" y="0.5" width="699" height="157" rx="12" fill="#101b30" stroke="#263e62"/>
  <g font-family="system-ui,sans-serif" font-size="10" fill="#b7cbed">
    ${monthLabels.join("\n    ")}
    <text x="12" y="67">Mon</text>
    <text x="12" y="87">Wed</text>
    <text x="12" y="107">Fri</text>
    <text x="470" y="140">Less</text>
    <text x="550" y="140">More</text>
  </g>
  <g>${squares.join("")}</g>
  <g>${legend.join("")}</g>
  <path d="M583 25v108" stroke="#304664"/>
  <g font-family="system-ui,sans-serif" text-anchor="middle">
    <text x="641" y="58" fill="#d6e4f9" font-size="11">Contributions</text>
    <text x="641" y="89" fill="#a9dcff" font-size="25" font-weight="700">${total}</text>
    <text x="641" y="108" fill="#b7cbed" font-size="11">Past year</text>
  </g>
</svg>
`;

await mkdir("dist", { recursive: true });
await writeFile("dist/contribution-calendar.svg", svg);
