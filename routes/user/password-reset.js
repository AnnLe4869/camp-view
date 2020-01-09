const router = require("express").Router();
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../../models/user");
const passport = require("passport");

require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/forgot", (req, res) => {
  res.render("users/forgot");
});
router.post("/forgot", async (req, res) => {
  try {
    const token = crypto.randomBytes(50).toString("hex");

    const foundUser = await User.findOneAndUpdate(
      {
        email: req.body.email
      },
      {
        resetPasswordToken: token,
        resetPasswordExpire: Date.now() + 15 * 60 * 1000
      }
    );
    if (!foundUser) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/forgot");
    }

    // Send email to user
    await sgMail.send({
      to: req.body.email,
      from: "nadom45981@mailon.ws",
      subject: "Node.js Password Reset",
      html: ` <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process: </p>
        <p>http://${req.headers.host}/reset/${token} </p>
        <p>The link will expire in 15 minutes </p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged. </p>`
    });
    // Display flash message if success
    req.flash("success", `An email has been sent to ${req.body.email}`);
    return res.redirect("/forgot");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});

// Show reset password form
router.get("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    res.render("users/reset", { token: req.params.token });
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});
router.post("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpire: {
          $gt: Date.now()
        }
      },
      {
        resetPasswordToken: null,
        resetPasswordExpire: null
      },
      { new: true }
    );
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    if (req.body.password === req.body.confirm) {
      await user.setPassword(req.body.password);
      await user.save();
    } else {
      res.redirect(`/reset/${req.params.token}`);
    }
    await sgMail.send({
      to: user.email,
      from: "nadom45981@mailon.ws",
      subject: "Successfully Password Reset",
      html: ` <p>Your password have been reset successfully</p>
        <p>If you didn't change the password, please go to the website to authenticate again.
           <strong> Someone may have steal your account </strong>
        </p>
        <p>Please click on the following link, or paste this into your browser to go back to the website</p>
        <p>http://${req.headers.host}/campgrounds </p> `
    });
    return res.redirect("/login");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});

module.exports = router;
