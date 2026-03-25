function getTotalLeads(leads) {
  return leads.length;
}

function getLeadsByStatus(leads) {
  return leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
}

function getTopScoredLeads(leads, limit = 5) {
  return [...leads]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, fullName, company, score, status }) => ({
      id,
      fullName,
      company,
      score,
      status
    }));
}

function getRecentlyAnalysed(leads, limit = 5) {
  return [...leads]
    .sort((a, b) => new Date(b.analysedAt) - new Date(a.analysedAt))
    .slice(0, limit)
    .map(({ id, fullName, company, analysedAt, status }) => ({
      id,
      fullName,
      company,
      analysedAt,
      status
    }));
}

function getReadyToContactList(leads) {
  return leads
    .filter((lead) => lead.readyToContact)
    .sort((a, b) => b.score - a.score)
    .map(({ id, fullName, company, score, email, status }) => ({
      id,
      fullName,
      company,
      score,
      email,
      status
    }));
}

function buildDashboard(leads) {
  return {
    totalLeads: getTotalLeads(leads),
    leadsByStatus: getLeadsByStatus(leads),
    topScoredLeads: getTopScoredLeads(leads),
    recentlyAnalysed: getRecentlyAnalysed(leads),
    readyToContact: getReadyToContactList(leads)
  };
}

module.exports = {
  buildDashboard,
  getLeadsByStatus,
  getReadyToContactList,
  getRecentlyAnalysed,
  getTopScoredLeads,
  getTotalLeads
};
