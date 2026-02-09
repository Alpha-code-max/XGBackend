const { getHomePageHtml, getProtectedPageHtml } = require('../views/indexViews');

const renderHome = (req, res) => {
  const html = getHomePageHtml(req.user);
  res.send(html);
};

const renderProtected = (req, res) => {
  const html = getProtectedPageHtml(req.user);
  res.send(html);
};

module.exports = {
  renderHome,
  renderProtected,
};