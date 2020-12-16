import React from 'react';
import moment from 'moment';
import Image from 'react-bootstrap/Image';
import { BiCalendarX } from "react-icons/bi";
import { ImCross } from "react-icons/im";
import { AuthContext } from './auth/AuthContext';
import Lecture from './API/Lecture';

const LectureItem = (props) => {

    let {lecture, waitings, bookings, bookSeat, addStudentToWaitingList, alreadyBooked, alreadyWaited, getBookingFromLecture} = props;

    alreadyBooked = (lectureId, studentId) => {
        const booking = getBookingFromLecture(lectureId, studentId);
        if (booking === 0) return true;
        return booking.active !== 1;
    }

    getBookingFromLecture = (lectureId, studentId) => {
        let booking = bookings.find((b) => {
            return b.ref_lecture === lectureId && b.ref_student === studentId
        })
        if (!booking) return 0;
        else return booking;
    }

    alreadyWaited = (lectureId) => {
        const ids = waitings.map( (w) => w.ref_lecture);
        if( ids.includes(lectureId) === true)
            return 1;
        else 
            return 0;
    }
    let a = 0

    return (
        <AuthContext.Consumer>
            {(context)=>(
            <>
                <tr key={lecture.id}>
                    <td>{ moment( new Date( lecture.date ) ).format( "YYYY-MM-DD" ) }</td>
                    <td>{ moment( new Date( lecture.date ) ).format( "HH:mm" ) }</td>
                    { lecture.presence === 1 && <td>yes</td> }
                    { lecture.presence === 0 && <td>no</td> }
                    <td>{ lecture.courseDesc }</td>
                    <td>{ lecture.classDesc }</td>
                    <td>{ lecture.teacherName + " " + lecture.teacherSurname }</td>

                    {alreadyWaited(lecture.id) === 0 && lecture.bookable === 1 && alreadyBooked(lecture.id) === 0 && lecture.date > moment().valueOf() ?
                    <td>
                        <Image width="30" height="30" className="img-button" type="button" src="/svg/calendar.svg" alt="" onClick={ () => bookSeat(context.authUser.id, lecture.id ) }/>
                    </td> : 
                    // TODO: Merge Waiting column to actions 
                    // TODO: check there is seats or not
                   alreadyWaited(lecture.id) === 1|| (alreadyBooked(lecture.id) === 1 && lecture.date > moment().valueOf()) ?
                    <td>
                        <Image width="30" height="30" className="img-button" type="button" src="/svg/forbid.svg" onClick= {() =>{ alert("You can not book this lecture!") } }/>
                    </td> :
                        /*do something if it fails*/
                    <td>
                        
                        <Image width="30" height="30" className="img-button" type="button" src="/svg/add.svg" alt=""
                            onClick={ () => addStudentToWaitingList(context.authUser.id, lecture.id ) }/>
                        
                    </td>
                    
                    }
                </tr>
            </>
             )}
        </AuthContext.Consumer>
    );
}

export default LectureItem;
