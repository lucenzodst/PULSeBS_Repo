const express = require( 'express' );

const pulsebsDAO = require( './pulsebsDAO' );
const morgan = require( 'morgan' ); // logging middleware
const jwt = require( 'express-jwt' );
const jsonwebtoken = require( 'jsonwebtoken' );
const cookieParser = require( 'cookie-parser' );
const moment = require( 'moment' );

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 900000; //seconds
const bcrypt = require( 'bcrypt' );

const schedule = require( 'node-schedule' );
const nodemailer = require( 'nodemailer' );
const { response } = require('express');


// Authorization error
const authErrorObj = {errors: [ {'param': 'Server', 'message': 'Authorization error'} ]};
const databaseErrorObj = {errors: [ {'param': 'Server', 'message': 'Error during DB execution'} ]};
const dataErrorObj = {errors: [ {'param': 'Server', 'message': 'Data sent is not correct'} ]};

let checkPassword = function ( user, password ) {
    /*
     The salt used to obfuscate passwords is 0
     console.log('hash:' + bcrypt.hashSync('password', 0));
    */
    return bcrypt.compareSync( password, user.hash );
}

//Initializing server
const app = express();
const port = 3001;

// Set-up logging
app.use( morgan( 'tiny' ) );

// Process body content
app.use( express.json() );

// Transporter needed to send emails
let mailOptions = null;
let transporter = nodemailer.createTransport( {
                                                  service: 'gmail',
                                                  port: 587,
                                                  secure: false, // true for 465, false for other ports
                                                  auth: {
                                                      user: 'noreply.pulsebs@gmail.com',
                                                      pass: 'pswteam9pulsebs',
                                                  },
                                                  tls: {
                                                      rejectUnauthorized: false
                                                  }
                                              } );

// Email sender (each day at 11PM)
schedule.scheduleJob( {hour: 23, minute: 0, second: 0}, () => {
    console.log( 'It is 11PM: sending emails to teachers for tomorrow\'s lessons' );

    // TESTED
    pulsebsDAO.getTomorrowLessonsStats()
              .then( ( lessons ) => {
                  if ( lessons !== 0 ) { // There is at least one lesson
                      lessons.forEach( l => {
                          mailOptions = {
                              from: '"PULSeBS Team9" <noreply.pulsebs@gmail.com>',
                              //to: l.email, // COMMENTED IN ORDER NOT TO SEND EMAILS TO RANDOM PEOPLE IN THE WORLD.
                              to: 'teacher.team9@yopmail.com',
                              subject: 'Tomorrow lesson (' + l.desc + ')',
                              text: "Dear " + l.surname + " " + l.name + " (" + l.id + "), here are some useful informations about tomorrow lesson:\n\n"
                                  + "     - Class: " + l.class + ".\n     - Course: '" + l.desc + "'.\n     - Number of students attending: " + l.nStudents + ".\n\nHave a good lesson.\n\n - PULSeBS Team9."
                          };

                          transporter.sendMail( mailOptions, function ( error, info ) {
                              if ( error ) {
                                  console.log( error );
                              } else {
                                  console.log( 'Email sent to: ' + l.id + ", info: " + info.response );
                              }
                          } );
                      } );
                  } else console.log( "There are no lessons tomorrow." )
              } ).catch(
        ( err ) => {
            console.log( err );
        }
    )
} );

// Authentication endpoint
app.post( '/api/login', ( req, res ) => {
    const email = req.body.email;
    const password = req.body.password;
    pulsebsDAO.getUserByEmail( email )
              .then( ( user ) => {
                  if ( user === undefined ) {
                      res.status( 404 ).send( {
                                                  errors: [ {'param': 'Server', 'message': 'Invalid e-mail'} ]
                                              } );
                  } else {
                      if ( !checkPassword( user, password ) ) {
                          res.status( 401 ).send( {
                                                      errors: [ {'param': 'Server', 'message': 'Wrong password'} ]
                                                  } );
                      } else {
                          //AUTHENTICATION SUCCESS
                          const token = jsonwebtoken.sign( {user: user.id}, jwtSecret, {expiresIn: expireTime} );
                          res.cookie( 'token', token, {httpOnly: true, sameSite: true, maxAge: 1000 * expireTime} );
                          res.json( {
                                        id: user.id,
                                        name: user.name,
                                        surname: user.surname,
                                        type: user.type,
                                        token: token
                                    } );
                      }
                  }
              } ).catch(
        // Delay response when wrong user/pass is sent to avoid fast guessing attempts
        ( err ) => {
            console.log( err );
            new Promise( ( resolve ) => {
                setTimeout( resolve, 1000 )
            } ).then( () => res.status( 401 ).json( authErrorObj ) )
        }
    );
} );

app.use( cookieParser() );

/*
 * Unprotected APIs
 */

app.post( '/api/logout', ( req, res ) => {
    res.clearCookie( 'token' ).status( 200 ).end();
} );


app.use(
    jwt( {
             secret: jwtSecret,
             getToken: req => req.cookies.token
         } )
);

// To return a better object in case of errors
app.use( function ( err, req, res, next ) {
    if ( err.name === 'UnauthorizedError' ) {
        res.status( 401 ).json( authErrorObj );
    }
} );

/*
 * Protected APIs
 */

/*TEACHER */

app.get( '/api/teacher/lectures', ( req, res ) => {
    const user = req.user && req.user.user;
    pulsebsDAO.getTeacherLectures( user )
              .then( ( lectures ) => {
                  res.json( lectures );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
} );

//TODO: change this route according to REST best practice
app.get( '/api/teacher/getStudentsForLecture', ( req, res ) => {
    const user = req.user && req.user.user;
    pulsebsDAO.getStudentsForLecturev2( user )
              .then( ( students ) => {
                  res.json( students );
              } ).catch( ( err ) => {
        res.status( 500 ).json( {
                                    errors: [ {'message': err} ],
                                } );
    } );
} );


//API for check authenticated User
app.get( '/api/user', ( req, res ) => {
    const userRequest = req.user && req.user.user;
    pulsebsDAO.getUserById( userRequest )
              .then( ( user ) => {
                  res.json( {
                                id: user.id,
                                name: user.name,
                                surname: user.surname,
                                type: user.type
                            } );
              } ).catch(
        (  ) => {
            res.status( 404 ).json( authErrorObj );
        }
    );
} );

/*
*   Update lecture
*       request body:
*           presence: has to be 0 in order to modify it accordingly; this information is redundant, but it sets the stage in case other
*               properties will be modifiable in future;
*/

app.put( '/api/teachers/:teacherId/lectures/:lectureId', ( req, res ) => {
    //const user = req.user && req.user.user;
    const teacherId = req.params.teacherId;
    const lectureId = req.params.lectureId;
    const presence = req.body.presence;
    if ( presence === 1 ) {
        res.status( 409 ).json( {message: "The lecture cannot be turnt to be in presence."} );
    } else if ( presence !== 0 ) {
        res.status( 422 ).json( {message: "The field presence has to be 0 and, moreover, it is compulsory."} );
    } else {

        pulsebsDAO.turnLectureIntoOnline( lectureId, teacherId ).then( ( information ) => {
            // if success
            res.status( 200 ).json( {
                                        message: "The selected lecture with id " + lectureId + " has been correctly turnt into an online lecture." +
                                            " Students booked for this lecture are going to be immediately informed of the change by email, if any is booked."
                                    } );

            if ( process.env.TEST && process.env.TEST === '0' ) {
                let mailOpts;
                information.map( studentAndLectureInfo => {
                    mailOpts = {
                        from: '"PULSeBS Team9" <noreply.pulsebs@gmail.com>',
                        to: 'student.team9@yopmail.com', // replace this row with studentAndLectureInfo.studentEmail
                        subject: 'Lecture of ' + studentAndLectureInfo.courseDescription + ' has just been turnt to be online',
                        text: "Dear " + studentAndLectureInfo.studentSurname + " " + studentAndLectureInfo.studentName +
                            " (" + studentAndLectureInfo.studentId + ")," +
                            " the lesson of the course " + studentAndLectureInfo.courseDescription + "," +
                            " planned to take place in class " + studentAndLectureInfo.lectureClass +
                            " on " + moment.unix( studentAndLectureInfo.lectureDate ).format( 'MMMM Do YYYY, h:mm:ss a' ) + "," +
                            " has been just turnt to be online by the teacher." + "\n\n" +
                            "Have a good virtual lesson.\n\n - PULSeBS Team9."
                    };
                    transporter.sendMail( mailOpts, function ( error, info ) {
                        if ( error ) {
                            console.log( "Some error occured in sending the email to " + info.studentEmail + ": " + error );
                        } else {
                            console.log( 'Email sent to: ' + studentAndLectureInfo.studentId + ", info: " + info.response );
                        }
                    } );
                } )
            }

        } ).catch( exitCode => {
            if ( exitCode === -1 ) {
                res.status( 404 ).json( {message: "No lecture exists with id " + lectureId + " ."} );
            } else if ( exitCode === -2 ) {
                res.status( 409 ).json( {message: "The selected lecture with id " + lectureId + " is not active yet."} );
            } else if ( exitCode === -3 ) {
                res.status( 409 ).json( {
                                            message: "The selected lecture with id " + lectureId + " cannot be turnt to be online because " +
                                                "it is starting within 30 minutes as of now."
                                        } );
            } else if ( exitCode === -4 ) {
                res.status( 500 ).json(
                    {
                        message:
                            "Internal error, the lecture has not been turnt into online.\n" +
                            "You can:\n" +
                            "\tRetry this operation\n" +
                            "\tRefresh the page and retry this operation\n" +
                            "\tLog out and log in back and retry this operation\n"
                    }
                );
            }
        } );
    }
} );

app.get('/api/teachers/:teacherId/statistics/courses/:courseId', (req, res) => {
    //const user = req.user && req.user.user;
    const teacherId = req.params.teacherId;
    const courseId = req.params.courseId;
    const groupBy = req.query.groupBy;

    pulsebsDAO.getTeacherBookingStatistics(teacherId, courseId, groupBy).then( statistics => {
        res.status(200).json(statistics);
    }).catch(error => {
        console.log(error);
        res.status(500).end();
    });
})

/****** STUDENT ******/

//GET /student/lectures
app.get( '/api/student/lectures', ( req, res ) => {
    const user = req.user && req.user.user;
    // const user = 269901;
    pulsebsDAO.getStudentLectures( user )
              .then( ( lectures ) => {
                  res.json( lectures );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
} );


//POST /student/booking
// FIXME: refactor
app.post( '/api/students/:studentId/booking', ( req, res ) => {
    const lectureId = req.body.lectureId;
    if ( !lectureId ) {
        res.status( 401 ).end();
    } else {
        const user = req.user && req.user.user;
        pulsebsDAO.bookSeat( lectureId, user )
                  .then( ( response ) => {
                      if ( process.env.TEST && process.env.TEST === '0' ) {
                          pulsebsDAO.getLectureStats( lectureId )
                                    .then( ( lecture ) => {

                                        pulsebsDAO.getInfoByStudentId( user )
                                                  .then( ( student ) => {
                                                      //var email = student.email;
                                                      let name = student.name;
                                                      let surname = student.surname;


                                                      // Send booking email to student
                                                      mailOptions = {
                                                          from: '"PULSeBS Team9" <noreply.pulsebs@gmail.com>',
                                                          //to: email, // COMMENTED IN ORDER NOT TO SEND EMAILS TO
                                                          // RANDOM PEOPLE IN THE WORLD
                                                          to: 'student.team9@yopmail.com',
                                                          subject: 'Booking confirmation (' + lecture.course + ')',
                                                          text: "Dear " + name + " " + surname + " (" + user + "), this email is to confirm that you have successfully booked for this lesson:\n\n"
                                                              + "     - Course: '" + lecture.course + "'.\n     - Classroom: " + lecture.classroom + ".\n     - Date: " + moment( lecture.date ).format( "YYYY-MM-DD HH:mm" ) + ".\n\nHave a good lesson.\n\n - PULSeBS Team9."
                                                      };

                                                      transporter.sendMail( mailOptions, function ( error, info ) {
                                                          if ( error ) {
                                                              console.log( error );
                                                          } else {
                                                              console.log( 'Email sent to: ' + l.id + ", info: " + info.response );
                                                          }
                                                      } );

                                                  } ).catch( ( err ) => {
                                            console.log( err );
                                        } );
                                    } ).catch( ( err ) => {
                              console.log( err );
                          } );
                      }
                      res.status( 201 ).json( {response} )
                  } )
                  .catch( ( err ) => {
                      res.status( 500 ).json( {errors: [ {'param': 'Server', 'msg': err} ],} )
                  } );
    }
} );


//GET /student/bookings

app.get( '/api/student/bookings', ( req, res ) => {
    const user = req.user && req.user.user;
    //const user = 269901;
    pulsebsDAO.getStudentBookings( user )
              .then( ( bookings ) => {
                  res.json( bookings );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
} )

// DELETE /student/bookings
//FIXME: refactor
app.delete( '/api/students/:studentId/bookings/:bookingId', ( req, res ) => {
    const bookingId = req.params.bookingId;
    if ( !bookingId ) {
        res.status( 401 ).end();
    } else {
        // const user = req.user && req.user.user;
        pulsebsDAO.cancelBookings( bookingId )
                  .then( ( response ) => response === 1 ?
                      res.status( 201 ).json( {response} ) :
                      res.status( 401 ).json( {response} )
                  )
                  .catch( ( err ) => {
                      res.status( 500 ).json( {
                                                  errors: [ {'param': 'Server', 'message': err} ],
                                              } );
                  } );
    }
} );
// FIXME:
app.delete( '/api/teachers/:teacherId/lectures/:lectureId', ( req, res ) => {
    const lectureId = req.params.lectureId;
    //const teacherId = req.params.teacherId;
    if ( !lectureId ) {
        res.status( 401 ).end();
    } else {
        // const user = req.user && req.user.user;
        pulsebsDAO.cancelLecture( lectureId )
                  .then( ( response ) => {
                      if ( process.env.TEST && process.env.TEST === '0' ) {
                          pulsebsDAO.getLectureStats( lectureId )
                                    .then( ( lecture ) => {
                                        pulsebsDAO.getStudentsForLecture( lectureId )
                                                  .then( ( students ) => {
                                                      if ( students.length !== 0 ) {
                                                          students.forEach( s => {
                                                              //var email = s.email;
                                                              let name = s.name;
                                                              let surname = s.surname;
                                                              let user = s.id;
                                                              mailOptions = {
                                                                  from: '"PULSeBS Team9" <noreply.pulsebs@gmail.com>',
                                                                  //to: email, // COMMENTED IN ORDER NOT TO SEND EMAILS
                                                                  // TO RANDOM PEOPLE IN THE WORLD.
                                                                  to: 'student.team9@yopmail.com',
                                                                  subject: 'Cancel Lecture (' + lecture.course + ')',
                                                                  text: "Dear " + name + " " + surname + " (" + user + "), this email is to confirm that the lesson of " + lecture.course + " in Classroom: " + lecture.classroom + " and Date: " + moment( lecture.date ).format( "YYYY-MM-DD HH:mm" ) + " is cancelled.\n\n"
                                                                      + "Have a good day.\n\n - PULSeBS Team9."
                                                              };
                                                              transporter.sendMail( mailOptions, function ( error, info ) {
                                                                  if ( error ) {
                                                                      console.log( error );
                                                                  } else {
                                                                      console.log( 'Email sent to: ' + user + ", info: " + info.response );
                                                                  }
                                                              } );
                                                          } );
                                                      }
                                                  } ).catch( ( err ) => {
                                            console.log( err );
                                        } );
                                    } ).catch( ( err ) => {
                              console.log( err );
                          } );
                      }
                      res.status( 200 ).json( {response} );
                  } )
                  .catch( ( err ) => {
                      res.status( 500 ).json( {
                                                  errors: [ {'param': 'Server', 'msg': err} ],
                                              } );
                  } );
    }
} );
/*
* /api/sofficer - PUT
* Called from client when a support officer wants to load data from .csv file.
* Thi API parse a JSON object and execute statements on DB.
* */
app.put( '/api/sofficer/', ( req, res ) => {
    //Ligh validation body
    if('classes' in req.body &&
        'courses' in req.body &&
        'lectures' in req.body &&
        'students' in req.body &&
        'subscriptions' in req.body &&
        'teachers' in req.body
    ) pulsebsDAO.loadCsvData( req.body )
              .then( () => res.status( 200 ).end() )
              .catch( () => res.status( 400 ).json( databaseErrorObj ) )
    else res.status( 400 ).json( dataErrorObj )

} )

//BOOKING MANAGER

app.get('/api/manager/getAllBookings',(req,res)=>{
    const course=req.query.course;
    const lecture=req.query.lecture;
    pulsebsDAO.getAllBookings(course,lecture)
              .then( ( bookings ) => {
                  res.json( bookings );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});

app.get('/api/manager/getAllAttendances',(req,res)=>{
    const course=req.query.course;
    const lecture=req.query.lecture;
    pulsebsDAO.getAllAttendances(course,lecture)
              .then( ( bookings ) => {
                  res.json( bookings );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});


app.get('/api/manager/getAllCancellationsLectures',(req,res)=>{
    const course=req.query.course;
    const lecture=req.query.lecture;
    pulsebsDAO.getAllCancellationsLectures(course,lecture)
              .then( ( cancellations ) => {
                  res.json( cancellations );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});

app.get('/api/manager/getAllCancellationsBookings',(req,res)=>{
    const course=req.query.course;
    const lecture=req.query.lecture;
    pulsebsDAO.getAllCancellationsBookings(course,lecture)
              .then( ( cancellations ) => {
                  res.json( cancellations );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});

app.get('/api/manager/getAllCourses',(req,res)=>{
    pulsebsDAO.getAllCourses()
              .then( ( courses ) => {
                  res.json( courses );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});

app.get('/api/manager/getAllLectures',(req,res)=>{
    pulsebsDAO.getAllLectures()
              .then( ( lectures ) => {
                  res.json( lectures );
              } )
              .catch( ( err ) => {
                  res.status( 500 ).json( {
                                              errors: [ {'message': err} ],
                                          } );
              } );
});


// Exported for E2E testing
exports.server = app;
app.disable("x-powered-by");
exports.handleToCloseServer = app.listen( port, () => console.log( `REST API server listening at http://localhost:${ port }` ) )
