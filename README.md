### This is the app that imitate the Yelp app, version 1

_Link for the workable version of the app_
[https://salty-temple-75247.herokuapp.com/](https://salty-temple-75247.herokuapp.com/)

**_Current features_**
**Summary**: User can create campground and comment, and user can edit only the campground and comment they created
**Detail**:

1. User can sign up, sign in and sign out
2. User can view all available campgrounds and see the detail of any individual one
3. When users signed in, they can create new campground or edit the campground they created
4. When users signed in, they can create new comment on any campground or edit any comment they wrote
5. When the user fail to sign in, they will be re-prompt to try again or create new account
6. The current campground, in simple form, show the image of the campground and name of it.
   In detail form, it show more info about the campground, the cost for one day going there, who create this campground, the description about the campground, and space for comment
7. The comment show who wrote it, the comment content, and when was it created

**UPDATE**: Additional features are added

1. User can request for a new password if he/she forgot their old password
2. User can subscribe for a specific author to receive a notification if the author create new campground
3. The comment is now on the page, without needing to go to another page
4. User can like/unlike a campground
5. User now can see the Google Map location of the campground they are reading
6. User can see how much like an view a campground has from the display page
7. Pagination is added
8. User now can search for the campground they want

**Plan for improvement**:

1. Add more requirement for password. Right now the password can be anything, and so will become a hugh security risk when the password is too easy to guess
2. Implement AJAX call for comment section, subscribe section, like section and pagination section so that user can stay on the page and not being redirected
3. Implement email verification for the register process
