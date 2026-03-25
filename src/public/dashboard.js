function renderList(elementId, items, renderItem) {
  const list = document.getElementById(elementId);
  list.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.textContent = "No records";
    list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = renderItem(item);
    list.appendChild(li);
  });
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString();
}

async function loadDashboard() {
  const response = await fetch("/api/dashboard");
  const data = await response.json();

  document.getElementById("total-leads").textContent = String(data.totalLeads);

  renderList(
    "leads-by-status",
    Object.entries(data.leadsByStatus).map(([status, count]) => ({ status, count })),
    ({ status, count }) => `<strong>${status}</strong>: ${count}`
  );

  renderList(
    "top-scored-leads",
    data.topScoredLeads,
    (lead) => `${lead.fullName} (${lead.company}) — <strong>${lead.score}</strong> [${lead.status}]`
  );

  renderList(
    "recently-analysed",
    data.recentlyAnalysed,
    (lead) => `${lead.fullName} (${lead.company}) — ${formatDate(lead.analysedAt)} [${lead.status}]`
  );

  renderList(
    "ready-to-contact",
    data.readyToContact,
    (lead) => `${lead.fullName} (${lead.company}) — <strong>${lead.score}</strong> · ${lead.email} [${lead.status}]`
  );
}

loadDashboard().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to load dashboard", error);
});
