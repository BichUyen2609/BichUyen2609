import { readFile, writeFile } from "node:fs/promises";

const art = new URL("../../assets/beyond/", import.meta.url);
const tech = new URL("../../assets/tech/", import.meta.url);
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const icon = async (file) => `data:image/svg+xml;base64,${(await readFile(new URL(file, tech))).toString("base64")}`;
const photo = async (file) => `data:image/jpeg;base64,${(await readFile(new URL(file, art))).toString("base64")}`;

const tools = [
  ["Languages & Markup", [["Python", "python.svg"], ["HTML", "html5.svg"]]],
  ["Frontend & Backend", [["Django", "django.svg"], ["FastAPI", "fastapi.svg"], [".NET", "dotnet.svg"]]],
  ["AI & Edge", [["YOLOv11", "ultralytics.svg"], ["Raspberry Pi", "raspberrypi.svg"]]],
  ["Tools & Database", [["Git", "git.svg"], ["PostgreSQL", "postgresql.svg"]]],
];
const projects = [
  {
    name: "Pill Counter",
    image: "pill-counter.jpg",
    description: ["Đếm viên thuốc trên khay", "bằng thị giác máy tính."],
    tags: ["YOLOv11", "Raspberry Pi"],
  },
  {
    name: "Trái tim cho em",
    image: "fundraising.jpg",
    description: ["Quản lý chiến dịch gây quỹ", "và ghi nhận đóng góp."],
    tags: ["Python", "Django"],
  },
  {
    name: "TaskHub",
    image: "taskhub.jpg",
    description: ["API quản lý công việc", "với truy vấn bất đồng bộ."],
    tags: ["FastAPI", "PostgreSQL"],
  },
];
const groups = await Promise.all(tools.map(async ([title, entries]) => ({
  title,
  entries: await Promise.all(entries.map(async ([name, file]) => ({ name, href: await icon(file) }))),
})));
for (const project of projects) {
  project.href = await photo(project.image);
}

function svg(title, width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
  <title id="title">${escape(title)}</title>
  <defs>
    <linearGradient id="panel" x2=".92" y2="1">
      <stop stop-color="#101e3b"/>
      <stop offset=".47" stop-color="#091326"/>
      <stop offset="1" stop-color="#070f20"/>
    </linearGradient>
    <linearGradient id="tile" x2="1" y2="1">
      <stop stop-color="#172747"/>
      <stop offset="1" stop-color="#0a152b"/>
    </linearGradient>
    <linearGradient id="rule">
      <stop stop-color="#3057a6" stop-opacity="0"/>
      <stop offset=".54" stop-color="#35beff"/>
      <stop offset="1" stop-color="#9bd5ff" stop-opacity=".18"/>
    </linearGradient>
    <linearGradient id="fade" x2="0" y2="1">
      <stop stop-color="#091326"/>
      <stop offset=".68" stop-color="#091326" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g font-family="system-ui,Segoe UI,sans-serif" fill="#e4efff">
    ${content}
  </g>
</svg>
`.replace(/[ \t]+$/gm, "");
}

function frame(width, height, title, symbol) {
  const ruleStart = 112 + title.length * 11;
  return `
    <rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="17" fill="url(#panel)" stroke="#264b7d"/>
    <path d="M16 1H${width - 16}M16 ${height - 1}H${width - 16}" stroke="url(#rule)"/>
    <text x="17" y="31" font-size="25" font-weight="700" fill="#7bc6ff">${symbol}</text>
    <text x="53" y="29" font-size="18" font-weight="750" letter-spacing=".45" fill="#d6eaff">${title}</text>
    <text x="${ruleStart - 34}" y="29" font-family="monospace" font-size="16" fill="#59beff">///</text>
    <path d="M${ruleStart - 7} 23H${width - 18}" stroke="url(#rule)"/>`;
}

function aboutPanel(width, height) {
  const code = [
    '<tspan fill="#f0a0ff">class</tspan> <tspan fill="#d6eaff">Developer:</tspan>',
    '    name = <tspan fill="#ffe299">"Bích Uyên"</tspan>',
    '    focus = <tspan fill="#ffe299">["Backend", "Computer Vision"]</tspan>',
    '    learning = <tspan fill="#ffe299">["FastAPI", "PostgreSQL"]</tspan>',
    '    <tspan fill="#f0a0ff">def</tspan> <tspan fill="#95d9ff">motto</tspan>(self):',
    '        <tspan fill="#f0a0ff">return</tspan> <tspan fill="#ffe299">"Code. Learn. Build. Repeat."</tspan>',
  ];
  const notes = [
    ["◇", "Sinh viên CNTT, thích xây phần mềm hữu ích."],
    ["✦", "Làm dự án Python, API và thị giác máy tính."],
    ["♪", "Thích chuyển động, âm thanh và viết lách."],
  ];
  return frame(width, height, "ABOUT ME", "◈") + `
    <rect x="14" y="44" width="${width - 28}" height="154" rx="11" fill="#09152b" stroke="#28436f"/>
    <path d="M47 58v126" stroke="#263b60"/>
    <g font-family="Consolas,monospace" font-size="14.4">
      ${code.map((line, index) => {
        const y = 68 + index * 20;
        const text = line.trimStart();
        const x = 57 + (line.length - text.length) * 8.64;
        return `<text x="27" y="${y}" fill="#758eb8">${index + 1}</text><text x="${x}" y="${y}">${text}</text>`;
      }).join("\n      ")}
    </g>
    ${notes.map(([symbol, note], index) => {
      const y = 226 + index * 25;
      return `<text x="22" y="${y}" font-size="19" fill="#7bc6ff">${symbol}</text><text x="54" y="${y}" font-size="15">${note}</text>`;
    }).join("\n    ")}
    <path d="M${width - 56} ${height - 1}h38" stroke="#61baff" stroke-opacity=".55"/>`;
}

function intro(width, fontSize) {
  const phrases = [
    "IT Student | Python Backend | Computer Vision",
    "FastAPI · Django · PostgreSQL",
    "Dream. Create. Explore.",
  ];
  const rail = width * .24;
  const accents = width > 600
    ? `<path d="M14 21H${rail}M${width - rail} 21H${width - 14}" stroke="url(#rule)"/>
       <text x="${rail + 22}" y="29" font-size="21" font-weight="700" fill="#59beff">&lt;/&gt;</text>
       <text x="${width - rail - 58}" y="29" font-size="21" font-weight="700" fill="#59beff">&lt;/&gt;</text>`
    : "";
  return svg(phrases[0], width, 44, `
    <style>
      .secondary { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .phrase { animation: visible 15s step-end var(--lag) infinite; }
        .mask { animation: type 15s steps(var(--letters), end) var(--lag) infinite; }
      }
      @keyframes visible { 0% { opacity: 1; } 33.33%, 100% { opacity: 0; } }
      @keyframes type { 0% { transform: translateX(var(--shift)); } 16%, 100% { transform: none; } }
    </style>
    <rect width="${width}" height="44" fill="#091326"/>
    ${accents}
    ${phrases.map((phrase, index) => {
      const span = phrase.length * fontSize * .6;
      return `<g class="phrase${index === 0 ? "" : " secondary"}" style="--lag: ${index * 5}s; --letters: ${phrase.length}; --shift: -${span}px">
        <clipPath id="reveal-${index}"><rect class="mask" x="${(width - span) / 2}" width="${span}" height="44"/></clipPath>
        <text x="${width / 2}" y="28" text-anchor="middle" font-family="Consolas,monospace" font-size="${fontSize}" fill="#d3e9ff"
          textLength="${span}" lengthAdjust="spacingAndGlyphs" clip-path="url(#reveal-${index})">${phrase}</text>
      </g>`;
    }).join("\n    ")}`);
}

function techPanel(width, height) {
  const tileWidth = (width - 42) / 2;
  return frame(width, height, "TECH STACK", "▱") + groups.map(({ title, entries }, index) => {
    const x = 14 + (index % 2) * (tileWidth + 14);
    const y = 44 + Math.floor(index / 2) * 126;
    const spacing = (tileWidth - 16) / entries.length;
    return `
      <rect x="${x}" y="${y}" width="${tileWidth}" height="114" rx="12" fill="url(#tile)" stroke="#314e83"/>
      <text x="${x + 13}" y="${y + 23}" font-size="15.5" font-weight="650" fill="#b7dbff">${escape(title)}</text>
      ${entries.map(({ name, href }, item) => {
        const center = x + 8 + spacing * (item + .5);
        return `<image href="${href}" x="${center - 18}" y="${y + 35}" width="36" height="36"/>
        <text x="${center}" y="${y + 93}" text-anchor="middle" font-size="14.2">${name}</text>`;
      }).join("\n      ")}`;
  }).join("");
}

function projectTile(project, x, y, width) {
  const textX = x + 100;
  let chipX = textX;
  const chips = project.tags.map((tag) => {
    const chipWidth = 14 + tag.length * 6;
    const chip = `<rect x="${chipX}" y="${y + 98}" width="${chipWidth}" height="18" rx="9" fill="#142c56" stroke="#315289"/>
    <text x="${chipX + chipWidth / 2}" y="${y + 111}" text-anchor="middle" font-size="10.2" fill="#c3e2ff">${tag}</text>`;
    chipX += chipWidth + 5;
    return chip;
  });
  return `
    <rect x="${x}" y="${y}" width="${width}" height="132" rx="12" fill="url(#tile)" stroke="#355592"/>
    <svg x="${x + 6}" y="${y + 6}" width="83" height="120" viewBox="0 0 83 120" overflow="hidden">
      <clipPath id="clip-${project.image}"><rect width="83" height="120" rx="8"/></clipPath>
      <image href="${project.href}" width="83" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${project.image})"/>
    </svg>
    <text x="${textX}" y="${y + 32}" font-size="17" font-weight="680">${project.name}</text>
    <text x="${textX}" y="${y + 57}" font-size="12.8" fill="#c2d3ee">${project.description[0]}</text>
    <text x="${textX}" y="${y + 75}" font-size="12.8" fill="#c2d3ee">${project.description[1]}</text>
    ${chips.join("\n    ")}`;
}

function focusPanel(width, height) {
  const topics = [
    ["◉", "Computer Vision", "YOLOv11 cho bài toán đếm thuốc"],
    ["❯", "Backend APIs", "FastAPI và PostgreSQL bất đồng bộ"],
    ["✧", "Creative Web", "Chuyển động và âm thanh trên web"],
  ];
  return frame(width, height, "CURRENTLY EXPLORING", "◌") + topics.map(([symbol, title, note], index) => {
    const y = 62 + index * 46;
    return `<text x="22" y="${y + 8}" font-size="22" fill="#76c5ff">${symbol}</text>
    <text x="57" y="${y}" font-size="15.5" font-weight="700">${title}</text>
    <text x="57" y="${y + 17}" font-size="12.9" fill="#bfd2ee">${note}</text>`;
  }).join("\n    ") + `<path d="M${width - 108} ${height - 12}q35 2 85 -35" fill="none" stroke="#518dff" stroke-opacity=".6"/>`;
}

const splitHeading = "About Bích Uyên and tech stack";
const projectsHeading = "Featured projects and currently exploring";
const aboutWidth = 458;
const aboutHeight = 303;
const techHeight = 296;
const wide = 1200;
const gap = 12;
const projectHeight = 198;
const focusWidth = 338;
const featuredWidth = wide - focusWidth - gap;
const featuredTileWidth = (featuredWidth - 48) / 3;
const smallProjectsHeight = 474;
const footer = await photo("skyline.jpg");

const assets = [
  ["intro.svg", intro(wide, 18)],
  ["intro-mobile.svg", intro(aboutWidth, 16)],
  ["about-and-tech.svg", svg(splitHeading, wide, aboutHeight, `
    ${aboutPanel(aboutWidth, aboutHeight)}
    <g transform="translate(${aboutWidth + gap})">${techPanel(wide - aboutWidth - gap, aboutHeight)}</g>`)],
  ["about-and-tech-mobile.svg", svg(splitHeading, aboutWidth, aboutHeight + gap + techHeight, `
    ${aboutPanel(aboutWidth, aboutHeight)}
    <g transform="translate(0 ${aboutHeight + gap})">${techPanel(aboutWidth, techHeight)}</g>`)],
  ["projects-and-focus.svg", svg(projectsHeading, wide, projectHeight, `
    ${frame(featuredWidth, projectHeight, "FEATURED PROJECTS", "▣")}
    ${projects.map((project, i) => projectTile(project, 14 + i * (featuredTileWidth + 10), 48, featuredTileWidth)).join("")}
    <g transform="translate(${featuredWidth + gap})">${focusPanel(focusWidth, projectHeight)}</g>`)],
  ["projects-and-focus-mobile.svg", svg(projectsHeading, aboutWidth, smallProjectsHeight + gap + projectHeight, `
    ${frame(aboutWidth, smallProjectsHeight, "FEATURED PROJECTS", "▣")}
    ${projects.map((project, i) => projectTile(project, 14, 48 + i * 140, aboutWidth - 28)).join("")}
    <g transform="translate(0 ${smallProjectsHeight + gap})">${focusPanel(aboutWidth, projectHeight)}</g>`)],
  ["footer.svg", svg("Code. Learn. Build. Repeat.", 1000, 111, `
    <rect width="1000" height="111" fill="#091326"/>
    <image href="${footer}" y="20" width="1000" height="91" preserveAspectRatio="xMidYMid slice"/>
    <rect width="1000" height="90" fill="url(#fade)"/>
    <path d="M90 51q117 22 225 4M692 55q105 -17 221 0" fill="none" stroke="url(#rule)"/>
    <text x="500" y="51" text-anchor="middle" font-family="Segoe Script,Bradley Hand,cursive" font-style="italic" font-size="31" fill="#c2e2ff">Code. Learn. Build. Repeat.</text>`)],
];

await Promise.all(assets.map(([name, artContent]) => writeFile(new URL(name, art), artContent)));
