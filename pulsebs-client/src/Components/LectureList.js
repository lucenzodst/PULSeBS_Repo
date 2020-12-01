import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Table } from "react-bootstrap";
import { AuthContext } from '../auth/AuthContext';
import Image from 'react-bootstrap/Image';
import { MdDeleteForever } from "react-icons/md"
import API from '../API/API.js';

import '../customStyle.css';

const LectureList = (props) => {
  let { lectures, idc, cancelLecture } = props;
  let courseName;
  if (lectures.filter(l => l.id === parseInt(idc))[0] !== undefined) { // Avoid to loose courseName after reload: override variable only if available.
    courseName = lectures.filter(l => l.id === parseInt(idc))[0].course;
  }

  return (
    <AuthContext.Consumer>
      {(context) => (
        <>
          <Table className="table" id="lectures-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Presence</th>
                <th>Class</th>
                <th colSpan='2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lectures.filter(l => l.id === parseInt(idc)).map((l, id) => <LectureItem key={id} lecture={l} idc={idc} index={l.lecId} cancelLecture={ cancelLecture } />)}
            </tbody>
          </Table>
        </>
      )}
    </AuthContext.Consumer>
  );

}



const LectureItem = (props) => {
  let { lecture, idc, index, cancelLecture } = props;

  let turnLectureIntoOnline = (lectureId, teacherId) => {
    API.turnLectureIntoOnline(lectureId, teacherId).then(result => {
      console.log(result);
    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <AuthContext.Consumer>
      {(context) => (
        <>
    <tr>
      <td><Link to={"/teacher/" + idc + "/lectures/" + index + "/students"}>{moment(lecture.date).format("DD MMM YYYY")}</Link></td>
      <td><Link to={"/teacher/" + idc + "/lectures/" + index + "/students"}>{moment(lecture.date).format("HH:mm")}</Link></td>
      <td><Link to={"/teacher/" + idc + "/lectures/" + index + "/students"}>{lecture.presence === 1 ? 'yes' : 'no'}</Link></td>
      <td><Link to={"/teacher/" + idc + "/lectures/" + index + "/students"}>{lecture.classC}</Link></td>
      <td>
        {lecture.presence === 1 ?
        <Image width="50" height="50" className="img-button" type="button" src="/svg/fromPresenceToOnline2.png" alt=""
          onClick={() => turnLectureIntoOnline(index,context.authUser.id)}/>
        : undefined}
      </td>
      {moment(lecture.date).isAfter(moment().add(1, 'hours')) && lecture.active===1 ?
               <td><Image
                   width="25" height="25" className="img-button" type="button" src="/svg/delete.svg" alt ="" onClick = {()=>cancelLecture(context.authUser.id, lecture.lecId,lecture.course)}/>
               </td>  : <td><MdDeleteForever size={25}/></td>
            }
    </tr>
    </>
      )}
    </AuthContext.Consumer>
  );
}

export default LectureList;
