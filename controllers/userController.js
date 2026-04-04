exports.getProfile = async (req, res, next) => {

  try {

    res.json({
      success: true,
      user: req.user
    });

  } catch (err) {
    next(err);
  }

};