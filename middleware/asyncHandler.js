function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next)
      .catch((error) => {
        next(error, 500)
      });
  }
}

module.exports = asyncHandler;