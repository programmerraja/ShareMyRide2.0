var nodemailer = require('nodemailer');
const crypto = require("crypto");
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const path = require("path");

function generateToken() {
  const token = crypto.randomBytes(10).toString("hex");
  return token;
}

function sendMail(subject, body, to_mail) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: to_mail,
      subject: subject,
      html: body
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        logError(err);
        resolve(false);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(true);
      }
    });
  });
}

async function sendPasswordReset(to_mail, user_name, link) {
  let subject = "Reset Your Password";
  let body = "<p>Hai " + user_name + ",</p>\
	 		<p>A request has been recevied to change the password for your Share My Ride account. This link only work for 20 minutes</p>\
	 		 <a href='" + link + "'>Reset Password </a>"
  let msg = await sendMail(subject, body, to_mail);
  return msg;

}

async function verfiyMail(to_mail, user_name, link) {

  let subject = "Verfiy Your Mail";
  let body = "<p>Hai " + user_name + ",</p>\
	 		<p>we're happy you signed up for Share My Ride. To start exploring the Share My Ride confirm your email address\
	 		 <a href='" + link + "'>Verfiy Now</a>"

  let msg = await sendMail(subject, body, to_mail);
  return msg;

}

async function sendBookRideMail(to_mail, user_name, user, link) {

  let subject = "New passenger";
  let body;
  if (user.passenger) {
    body = "<p>Hai " + user_name + ",</p>\
			 		<p>Your <a href='" + link + "'>ride </a>is booked. <p>\
			 		<p>" + user.name + " just booked to travel with you.</p>\
			 		<p>whatsappno: " + user.whatsappno + "</p>\
			 		<p>No of passenger going to join with you " + user.passenger + "</p></p></p>\
			 		<p>" + user.name + " sent you a message</p><p>&quot;" + user.message + "&quot;</p>"
  } else {
    body = "<p>Hai " + user_name + ",</p>\
			 		<p>Your <a href='" + link + "'>ride </a>is booked</p>\
			 		<p>" + user.name + " just booked to travel with you</p>\
			 		<p>whatsappno: " + user.whatsappno + "</p>\
			 		<p>" + user.name + " sent you a message</p><p>&quot;" + user.message + "&quot;</p>"
  }
  let msg = await sendMail(subject, body, to_mail);
  return msg;

}
async function sendUnBookRideMail(to_mail, user_name, user, link) {
  let subject = "You Ride is UnBooked";
  let body = "<p>Hai " + user_name + ",</p>\
			 		<p>Your <a href='" + link + "'>ride </a>is unbooked by " + user.name + " <p>\
			 		<p>whatssapp number: " + user.whatsappno + "</p>\
			 		<p>No of seats unbooked: " + user.passenger + "</p></p></p>\
          <p> For more contact him through whatsapp number\
          <p>" + user.name + " sent you a reason to unbook</p><p>&quot;" + user.reason + "&quot;</p>"

  let msg = await sendMail(subject, body, to_mail);
  return msg;

}

async function sendAlertMail(to_mail, user_name, alert, link, alert_link) {
  let subject = "You Have Alert";
  let body = "<p>Hai " + user_name + ",</p>\
			 		<p>You have ride alert for " + alert.from + " to " + alert.to + "\
			 		check the ride <a href='" + link + "'>here</a></p>\
			 		<p>To stop this alert click<a href='" + alert_link + "'>here</a> "

  let msg = await sendMail(subject, body, to_mail);
  return msg;

}
async function sendConfrimAlertMail(to_mail, user_name, alert,alert_link) {
  let subject = "Your Ride alert has been created";
  let body = "<p>Hai " + user_name + ",</p>\
          <p>Your Ride alert has been created for search " + alert.from + " to " + alert.to + "\
          </p>\
          <p>To stop this alert click<a href='" + alert_link + "'>here</a> "

  let msg = await sendMail(subject, body, to_mail);
  return msg;

}
class AppError extends Error {
  constructor(err, status_code) {
    super(err.message);
    this.status_code = status_code;
    this.message = err.message;
  }
}



/**
 * Get the error message from error object
 */
function dbErrorHandler(err) {
  let message = '';
  console.log(err);
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "Email already Exist"
        break
      default:
        message = 'Something went wrong. Please try again'
    }
  } else {
    message = "Something went wrong. Please try again"
  }

  return message;
}

function logError(err) {
  console.log("------------------------------------");
  console.log("Error:", err);
  console.log("------------------------------------");

}

function convertTimeToString(time) {
  //copied from stack overflow
  var timeSplit = time.split(':'),
    hours, minutes, meridian;
  hours = timeSplit[0];
  minutes = timeSplit[1];

  if (hours > 12) {
    meridian = 'PM';
    hours -= 12;
  } else if (hours < 12) {
    meridian = 'AM';
    if (hours == 0) {
      hours = 12;
    }
  } else {
    meridian = 'PM';
  }
  return [hours, minutes, meridian];
}

function convertTimeToTime(time) {
  var timeSplit = time.split(':'),
    hours, minutes, temp, meridian;
  hours = parseInt(timeSplit[0]);
  //spliting min and meridian
  temp = timeSplit[1].split(" ");
  minutes = parseInt(temp[0]);
  meridian = temp[1];


  if (meridian === "PM" && hours != 12) {
    hours += 12;
  } else if (meridian === "AM") {
    if (hours == 12) {
      hours = 0;
    }
  }
  //adding zero in front if it is one digit number
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes
  return hours + ":" + minutes + ":00";
}

const storage = new GridFsStorage({
  url: process.env.DBURL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'profiles'
        };
        resolve(fileInfo);
      });
    });
  }
});

//middleware to store file in db
const upload = multer({
  storage
});

module.exports = {
  generateToken,
  sendPasswordReset,
  sendBookRideMail,
  sendUnBookRideMail,
  sendAlertMail,
  sendConfrimAlertMail,
  verfiyMail,
  AppError,
  logError,
  dbErrorHandler,
  convertTimeToString,
  convertTimeToTime,
  upload
};