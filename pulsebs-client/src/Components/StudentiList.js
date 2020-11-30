import React     from 'react';
import { Table } from "react-bootstrap";
import {AuthContext} from '../auth/AuthContext';

const StudentList = ( props ) => {
    let {students,idl} =props;

    //let student = students.filter( e => e.lId === parseInt( idl ) );
    return (
      <AuthContext.Consumer>
            {(context)=>(
                <>
                <Table className="table" id="lectures-table">
                    { students.filter(e => e.lId === parseInt( idl ) ).length !== 0 && <>
                     <thead>
                     <tr>
                         <th>Id</th>
                     </tr>
                     </thead>
                     <tbody>
                     {students.filter( e => e.lId === parseInt( idl ) )
                      .map( ( s, id ) => 
                      <StudentItem key={ id } student={ s }/> 
                      ) }
                      </tbody> 
                      </>
                      }
                      { students.filter(e => e.lId === parseInt( idl ) ).length === 0 &&
                         <h5>no students booked for this lecture.</h5>
                      }
                </Table>
                </>
            )}
        </AuthContext.Consumer>
    );

}

const StudentItem = ( props ) => {
    let {student} = props;

    return (
        <tr>
            <td>{ student.studentId }</td>
        </tr>
    );
}

export default StudentList;
