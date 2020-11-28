import React       from 'react';
import LectureItem from './LectureItem';
import {AuthContext} from './auth/AuthContext';

const LecturesList = ( props ) => {

    let {lectures, bookings, bookSeat, alreadyBooked} = props;

    return (
      <AuthContext.Consumer>
            {(context)=>(
              <>
                { lectures.length !== 0 &&
                <table className="table" id="lectures-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Presence</th>
                        <th>Course</th>
                        <th>Class</th>
                        <th>Teacher</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    { lectures.map( ( l ) => <LectureItem key={ l.id } lecture={ l } bookings={bookings} bookSeat={ bookSeat } alreadyBooked={ alreadyBooked } /> ) }
                    </tbody>
                </table>
                }
              </>
            )}
      </AuthContext.Consumer>
    );
}

export default LecturesList;
