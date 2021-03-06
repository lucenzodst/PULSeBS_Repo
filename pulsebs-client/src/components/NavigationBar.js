import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { AiOutlineTable } from 'react-icons/ai';
import { FaBookOpen, FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { IoIosStats } from 'react-icons/io';
import { RiVirusFill } from 'react-icons/ri';
import { Link, Route, Switch } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import '../style/App.css';
import '../style/customStyle.css';
import Tutorial from './Tutorial';


class NavigationBar extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <AuthContext.Consumer>
        {(context) => (
          <>
            <Navbar id="menu-navbar" expand="sm" variant="dark">
              <Switch>
                <Route path='/student'>
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                      {/*<Nav.Link href='/student'> Home <FaHome className={"ml-0.5"} /></Nav.Link>*/}
                      <Tutorial on={true} text='Here you can find the lectures available in the next days, grouped by course.' push={
                        <Nav.Link href='/student/lectures'> Lectures <FaBookOpen className={"ml-0.5"} /></Nav.Link>
                      } />
                      <Tutorial on={true} text='Here you can find the bookings of the next days and the bookings in waiting list which will be accepted whenever a seat becomes available.' push={
                        <Nav.Link href='/student/bookings'> Bookings&Waitings <FaCalendarAlt className={"ml-0.5"} /> </Nav.Link>
                      } />
                      <Tutorial on={true} text='Navigate the schedule of past, present and approaching lectures.' push={
                        <Nav.Link href='/student/calendar'> Calendar <FaCalendarAlt className={"ml-0.5"} /> </Nav.Link>
                      } />
                    </Nav>
                  </Navbar.Collapse>
                </Route>
                <Route path='/teacher'>
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                      <Tutorial on={true} text="Navigate here your courses, lectures and the associated student's bookings." push={
                        <Nav.Link href='/teacher/courses'> Courses <FaBookOpen className={"ml-0.5"} /> </Nav.Link>
                      } />
                      <Tutorial on={true} text="Monitor the number of students attending your lectures." push={
                        <Nav.Link href={`/teacher/${this.props.userId}/statistics/courses`}> Statistics <IoIosStats className={"ml-0.5"} /></Nav.Link>
                      } />
                    </Nav>
                  </Navbar.Collapse>
                </Route>
                <Route path='/manager'>
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                      <Nav.Link href="/manager/allStats">All <AiOutlineTable className={"ml-0.5"} /></Nav.Link>
                      <Nav.Link href="/manager/bookings">Bookings <AiOutlineTable className={"ml-0.5"} /></Nav.Link>
                      <Nav.Link href="/manager/cancellationsLectures">Cancellations Lectures <AiOutlineTable className={"ml-0.5"} /></Nav.Link>
                      <Nav.Link href="/manager/cancellationsBookings">Cancellations Bookings <AiOutlineTable className={"ml-0.5"} /></Nav.Link>
                      <Nav.Link href="/manager/attendances">Attendances <AiOutlineTable className={"ml-0.5"} /></Nav.Link>
                      <Nav.Link href="/manager/tracing">Contact tracing <RiVirusFill className={"ml-0.5"} /></Nav.Link>
                    </Nav>
                  </Navbar.Collapse>
                </Route>
                <Route path='/supportOffice'>
                  <Navbar.Collapse id="basic-navbar-nav">
                   <Nav className="mr-auto">
                      {/*<Nav.Link href="/supportOffice/manageLectures">Manage Lectures <FaBookOpen className={"ml-0.5"} /></Nav.Link>*/}
                      <Nav.Link href="/supportOffice/uploadFile">Upload Files<FaCalendarAlt className={"ml-0.5"} /></Nav.Link>
                    </Nav>
                  </Navbar.Collapse>
                  </Route>
              </Switch>
              <Navbar.Brand>
                <Tutorial on={true} text={<p>This is your identification number.</p>} push={
                  <><FaUserCircle className={"ml-1"} /> {this.props.userId}</>
                } />
              </Navbar.Brand>
              <div>
                <Link to='/' onClick={() => context.logoutUser()}>
                  <Tutorial on={true} text='Log out from the portal. See you soon!' push={
                    'Log out'
                  } />
                </Link>
              </div>
            </Navbar>
          </>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default NavigationBar;
