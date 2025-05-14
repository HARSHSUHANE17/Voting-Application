## Voting application

A functionality where user can give vote to the given set of candidates

#Functionality:
1) user sign in/sign up
2) see the list of candidate
3) vote one of the candidate, user can't vote again
4) there is a route which shows the list of candidates and their live vote counts sorted by their vote count
5) user data must contain their one unique government if proof named : aadhar card number(12 digit)
6) there should be one admin who can only maintain the table of candidates and he can't be able to vote all
7) user can change their password
8) user can login with their password and aadhar card number
9) admin can't vote at all 


# Endpoints 
 
 1) User Authentication:
    /signup: POST - Create a new user account.
    /login: POST - Log in to an existing account. [ aadhar card number + password ]

2) Voting:
    /candidates: GET - Get the list of candidates.
    /vote/:candidateId: POST - Vote for a specific candidate.

3) Vote Counts:
    /vote/counts: GET - Get the list of candidates sorted by their vote counts.

4) User Profile:
    /profile: GET - Get the user's profile information.
    /profile/password: PUT - Change the user's password.

5) Admin Candidate Management:
    /candidates: POST - Create a new candidate.
    /candidates/:candidateId: PUT - Update an existing candidate.
    /candidates/:candidateId: DELETE - Delete a candidate from the list.