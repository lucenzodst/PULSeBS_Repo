# PULSeBS - Team 9
## Important documents
- https://docs.google.com/document/d/1AifxbhVeeMtsyYsEbVNopr66S-grZAHy/edit
- https://docs.google.com/document/d/1ELJbPE27IaUL6TSb6JUdjA4l5-gVSvVsMUWpgQc8V7Q/edit#heading=h.wa25ir5z6t83
## Routes design
Feel free to edit every route according to your needings
- \ - Landing page ( login form )
#### STUDENT
- \student - Student home ( Button HUB )
- \student\lectures - List of lecture available for booking
- \student\bookings - List of student's bookings
#### TEACHER
- \teacher - Teacher home ( Button HUB )
- \teacher\courses - List of courses
- \teacher\courseId\lectures - List of course's lectures
- \teacher\courseId\lectureId\students - List of students booked for a lecture
#### STAFF
- \staff - Staff home ( maybe this could be splitted later )
## Design notes
- Same login page for every user type
- Canonical server architecture for backend in server.js
