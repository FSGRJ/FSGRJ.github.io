const username = "FSGRJ";

const summaryContent = document.getElementById("insightsContent");
const overviewList = document.getElementById("overviewList");
const reposContent = document.getElementById("reposContent");
const followersList = document.getElementById("followersList");
const followingList = document.getElementById("followingList");
const starredList = document.getElementById("starredList");
const languageFilter = document.getElementById("languageFilter");
const headerStatus = document.getElementById("headerStatus");

const avatarLarge = document.getElementById("avatarLarge");
const avatarMini = document.getElementById("avatarMini");
const nameProfile = document.getElementById("nameProfile");
const nameMini = document.getElementById("nameMini");
const loginProfile = document.getElementById("loginProfile");
const bioProfile = document.getElementById("bioProfile");
const locationProfile = document.getElementById("locationProfile");
const companyProfile = document.getElementById("companyProfile");
const blogProfile = document.getElementById("blogProfile");
const createdProfile = document.getElementById("createdProfile");

const totalReposEl = document.getElementById("totalRepos");
const followersStatEl = document.getElementById("followersStat");
const followingStatEl = document.getElementById("followingStat");
const starsStatEl = document.getElementById("starsStat");
const gistsStatEl = document.getElementById("gistsStat");
const activeReposStatEl = document.getElementById("activeReposStat");

let allRepos = [];
let allStarred = [];
let allFollowers = [];
let allFollowing = [];

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    "C#": "#178600",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    PHP: "#4F5D95",
    Go: "#00ADD8",
    Ruby: "#701516",
    Rust: "#dea584",
    Kotlin: "#A97BFF",
    Dart: "#00C4B3",
    Vue: "#41b883",
    React: "#61dafb",
    "Jupyter Notebook": "#DA5B0B",
    C: "#555555",
    "C++": "#f34b7d",
    Dockerfile: "#384d54",
    "PowerShell": "#012456"
  };

  return colors[language] || "#7bb4ff";
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "GitHub-Premium-Dashboard"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function renderOverview(user, repos) {
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))].slice(0, 4).join(", ") || "Not specified";
  const lastUpdated = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  const items = [
    `${user.public_repos} public repositories in the profile.`,
    `${user.followers} followers and ${user.following} following.`,
    `Main languages: ${languages}.`,
    lastUpdated ? `Last updated: ${formatDate(lastUpdated.updated_at)}.` : "No recent activity records.",
    user.company ? `Company: ${user.company}.` : "Company not informed.",
    user.location ? `Location: ${user.location}.` : "Location not informed."
  ];

  overviewList.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

function renderInsights(user, repos) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const activeRepos = repos.filter(repo => {
    const date = new Date(repo.updated_at);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    return date > cutoff;
  }).length;

  const chips = [
    `⭐ ${totalStars} stars received`,
    `🧩 ${activeRepos} active repositories`,
    `🕒 Joined ${formatDate(user.created_at)}`
  ];

  summaryContent.innerHTML = chips.map(chip => `<div class="insight-chip">${chip}</div>`).join("");
}

function renderProfile(user) {
  avatarLarge.src = user.avatar_url;
  avatarMini.src = user.avatar_url;
  nameProfile.textContent = user.name || user.login;
  nameMini.textContent = user.name || user.login;
  loginProfile.textContent = `@${user.login}`;
  bioProfile.textContent = user.bio || "No public bio available.";
  locationProfile.textContent = user.location || "—";
  companyProfile.textContent = user.company || "—";

  if (user.blog) {
    blogProfile.innerHTML = `<a href="${user.blog}" target="_blank" rel="noreferrer">${user.blog}</a>`;
  } else {
    blogProfile.textContent = "—";
  }

  createdProfile.textContent = formatDate(user.created_at);
}

function renderStats(user, repos) {
  totalReposEl.textContent = user.public_repos;
  followersStatEl.textContent = user.followers;
  followingStatEl.textContent = user.following;
  starsStatEl.textContent = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  gistsStatEl.textContent = user.public_gists;

  const activeRepos = repos.filter(repo => {
    const date = new Date(repo.updated_at);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    return date > cutoff;
  }).length;

  activeReposStatEl.textContent = activeRepos;
}

function buildLanguageOptions(repos) {
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  languageFilter.innerHTML = ['<option value="">All Languages</option>']
    .concat(languages.map(language => `<option value="${language}">${language}</option>`))
    .join('');
}

function getFilteredRepos() {
  const selected = languageFilter.value;
  if (!selected) return allRepos;
  return allRepos.filter(repo => repo.language === selected);
}

function renderRepoCards() {
  const filtered = getFilteredRepos();

  reposContent.innerHTML = filtered
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map(repo => {
      const color = getLanguageColor(repo.language);
      return `
        <div class="repo-item-premium">
          <div class="repo-top-premium">
            <a class="repo-name-premium" href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a>
          </div>
          <div class="repo-desc-premium">${repo.description || "No description available."}</div>
          <div class="repo-meta-premium">
            <span><span class="lang-dot" style="background:${color};"></span>${repo.language || "—"}</span>
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
          </div>
        </div>
      `;
    }).join("") || "<div class='repo-desc-premium'>No repositories match the selected language.</div>";
}

function renderPeople(list, target) {
  if (!list || !list.length) {
    target.innerHTML = `<div class="repo-desc-premium">No users found.</div>`;
    return;
  }

  target.innerHTML = list.slice(0, 10).map(user => `
    <div class="people-item-premium">
      <img src="${user.avatar_url}" alt="${user.login}" />
      <a href="${user.html_url}" target="_blank" rel="noreferrer">${user.login}</a>
    </div>
  `).join("");
}

function renderStarred(starred) {
  if (!starred || !starred.length) {
    starredList.innerHTML = `<div class="repo-desc-premium">No starred repositories.</div>`;
    return;
  }

  starredList.innerHTML = starred.slice(0, 8).map(repo => `
    <div class="starred-item">
      <a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.full_name}</a>
      <div class="repo-desc-premium">${repo.description || "No description available."}</div>
      <div class="repo-meta-premium">
        <span><span class="lang-dot" style="background:${getLanguageColor(repo.language)};"></span>${repo.language || "—"}</span>
        <span>⭐ ${repo.stargazers_count}</span>
      </div>
    </div>
  `).join("");
}

function renderLanguageChart(repos) {
  const counts = {};
  repos.forEach(repo => {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  });

  const labels = Object.keys(counts).slice(0, 6);
  const data = Object.values(counts).slice(0, 6);

  new Chart(document.getElementById("languageChartPremium"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map(label => getLanguageColor(label)),
        borderColor: "rgba(15, 23, 42, 0.9)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#edf3ff"
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed} repos`
          }
        }
      }
    }
  });
}

function renderDistributionChart(repos) {
  const stats = {
    Public: repos.length,
    Forked: repos.filter(r => r.fork).length,
    Archived: repos.filter(r => r.archived).length,
    Private: repos.filter(r => r.private).length
  };

  new Chart(document.getElementById("repoDistributionChart"), {
    type: "polarArea",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        data: Object.values(stats),
        backgroundColor: ["#7bb4ff", "#80ffb5", "#ffc857", "#ff6b6b"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#edf3ff"
          }
        }
      }
    }
  });
}

function renderStarsChart(repos) {
  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

  new Chart(document.getElementById("starsChart"), {
    type: "bar",
    data: {
      labels: top.map(repo => repo.name),
      datasets: [{
        label: "Stars",
        data: top.map(repo => repo.stargazers_count),
        backgroundColor: top.map(repo => getLanguageColor(repo.language)),
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { color: "#edf3ff" },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "#edf3ff" },
          grid: { color: "rgba(255,255,255,0.04)" }
        }
      }
    }
  });
}

function renderActivityChart(repos) {
  const recent = [...repos].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at)).slice(-6);

  new Chart(document.getElementById("activityChart"), {
    type: "line",
    data: {
      labels: recent.map(repo => repo.name),
      datasets: [{
        label: "Updated repositories",
        data: recent.map(repo => repo.stargazers_count),
        borderColor: "#7bb4ff",
        backgroundColor: "rgba(123,180,255,0.15)",
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "#edf3ff" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#edf3ff" },
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "#edf3ff" },
          grid: { color: "rgba(255,255,255,0.04)" }
        }
      }
    }
  });
}

function attachFilterEvent() {
  languageFilter.addEventListener("change", renderRepoCards);
}

function initSections() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(node => node.classList.remove("active"));
      item.classList.add("active");

      document.querySelectorAll(".section").forEach(section => section.classList.remove("section-active"));
      const sectionId = item.dataset.section;
      const target = document.getElementById(sectionId);
      if (target) target.classList.add("section-active");
    });
  });
}

async function loadDashboard() {
  try {
    headerStatus.textContent = "Loading profile data...";

    const user = await fetchJson(`https://api.github.com/users/${username}`);
    const repos = await fetchJson(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const starred = await fetchJson(`https://api.github.com/users/${username}/starred?per_page=8`);
    const followers = await fetchJson(`https://api.github.com/users/${username}/followers?per_page=10`);
    const following = await fetchJson(`https://api.github.com/users/${username}/following?per_page=10`);

    allRepos = repos;
    allStarred = starred;
    allFollowers = followers;
    allFollowing = following;

    renderProfile(user);
    renderOverview(user, repos);
    renderInsights(user, repos);
    renderStats(user, repos);
    buildLanguageOptions(repos);
    renderRepoCards();
    renderPeople(followers, followersList);
    renderPeople(following, followingList);
    renderStarred(starred);

    renderLanguageChart(repos);
    renderDistributionChart(repos);
    renderStarsChart(repos);
    renderActivityChart(repos);

    document.getElementById("followerCount").textContent = `${followers.length} followers`;
    document.getElementById("followingCount").textContent = `${following.length} following`;

    headerStatus.textContent = `${user.login} profile loaded successfully`;
  } catch (error) {
    console.error(error);
    headerStatus.textContent = "Error loading data";
    summaryContent.innerHTML = "<div class='repo-desc-premium'>Unable to load GitHub data. Try again later.</div>";
  }
}

initSections();
attachFilterEvent();
loadDashboard();
