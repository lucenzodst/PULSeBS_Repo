import React    from 'react';
import moment   from 'moment';
import { Link } from 'react-router-dom';
import { Table }    from "react-bootstrap";

const LectureList = ( props ) => {
  let {lectures,idc,getLectures } = props;
  //getLectures();
  let courseName;
  if(lectures.filter(l=>l.id===parseInt(idc))[0] != undefined) { // Avoid to loose courseName after reload: override variable only if available.
    courseName = lectures.filter(l=>l.id===parseInt(idc))[0].course;
  }

    return (
        <Table className="table" id="lectures-table">
            <thead>
            <tr>
                <th>{ courseName }</th>             
            </tr>
            </thead>
            <tbody>
            { lectures.filter(l=>l.id===parseInt(idc)).map( ( l, id ) => <LectureItem key={ id } lecture={ l } idc={ idc } index={ l.lecId }/> ) }
            </tbody>
        </Table>
    );

}

const LectureItem = ( props ) => {
    let {lecture, idc, index} = props;

    return (

        <tr>
            <td><Link
                to={ "/teacher/" + idc + "/" + index + "/students" }>[{lecture.lecId}] { moment( lecture.date ).format( "DD MMM YYYY HH:mm" ) } -
                    { moment( lecture.date ).add(1.5, "hours").format( "HH:mm" ) } | Classroom: {lecture.classC}
                </Link>
            </td>
        </tr>

    );
}

export default LectureList;
