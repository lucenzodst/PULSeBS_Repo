import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Jumbotron from 'react-bootstrap/Jumbotron';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import '../style/customStyle.css';
import Tutorial from './Tutorial';


class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', redirect: false, invalidCredentials: false };
  }

  isEmailInvalid(email) {
    if (!email.localeCompare('')) return undefined;
    else return !email.includes('@');
  }

  login = (event, logIn) => {
    event.preventDefault();
    logIn(this.state.email, this.state.password);
    this.setState({ redirect: true, invalidCredentials: false });
  }

  render() {

    return <>

      <AuthContext.Consumer>
          {(context)=>(
           <>
            {context.authUser && this.state.redirect ? <Redirect to={{ pathname: context.authUser.type === 0 ? '/student/lectures' : context.authUser.type === 1 ? '/teacher/courses' : context.authUser.type===2 ? '/manager/allStats': '/supportOffice/uploadFile'}} /> : undefined}
            <Form id='loginForm' method="POST" onSubmit={(event) => this.login(event, context.loginUser)}>
              <Form.Row style={{marginTop: '60px', marginBottom: '40px'}}><h1 style={{fontSize: '5rem'}}>Login</h1></Form.Row>
              <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="text" placeholder="Enter email" isInvalid={this.isEmailInvalid(this.state.email)} onChange={event => this.setState({ email: event.target.value })} />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                  </Form.Text>
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" onChange={event => this.setState({ password: event.target.value })} />
              </Form.Group>
              {!context.authErr ? undefined :
                context.authErr.status === 401 ?
                  //<Jumbotron className='error'><p>Token expired.</p></Jumbotron>:<Jumbotron className='error'><p>Invalid email or password.</p></Jumbotron>
                  console.log("Token expired") : <Jumbotron className='error'><p>Invalid email or password.</p></Jumbotron>
              }

              <Form.Group>
                <Tutorial on={true} text='Click here to enter your personal page on the teaching portal.' push={
                  <Button variant="primary" type="submit" disabled={!this.state.email.includes('@') || this.state.password.length === 0}>Log in</Button>
                } />
              </Form.Group>


            </Form>
          </>
        )}
      </AuthContext.Consumer>

    </>;
  }
}

export default LoginPage;
