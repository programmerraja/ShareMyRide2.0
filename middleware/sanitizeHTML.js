const sanitizeHtml = require("sanitize-html");

function sanitizeHTML(req, res, next) {
  for (let key of Object.keys(req.body)) {
    //not allowing any tag to user use
    if(!req.body[key]==="goods&services"){

	    
	    req.body[key] = sanitizeHtml(req.body[key], {
	      allowedTags: [],
	      allowedAttributes: {}
	    });
	}
  }
  next();
}

module.exports = sanitizeHTML;