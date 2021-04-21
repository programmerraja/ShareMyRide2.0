const sanitizeHtml = require("sanitize-html");

function sanitizeHTML(req, res, next) {
  console.log();

  // req.body=sanitizeHtml(req.body);
  console.log(req.body.password);
  for (let key of Object.keys(req.body)) {
    //not allowing any tag to user use
    req.body[key] = sanitizeHtml(req.body[key], {
      allowedTags: [],
      allowedAttributes: {}
    });
  }

  next();
}

module.exports = sanitizeHTML;