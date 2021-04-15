function adminAuthHandler(req, res, next) {
    if (req.user && req.user.is_admin) {
        next()
    } else {
        res.redirect("/");
    }

}

module.exports = adminAuthHandler;