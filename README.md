# Smart Issue Board

Smart Issue Board is a simple issue tracking web application built using React and Firebase.

Users can sign up, log in, create issues, assign priority and status, and track them in real time.

---

## Frontend Stack

- React (with Vite) for fast and simple frontend development  
- Firebase Authentication for user login and signup  
- Firebase Firestore for storing and managing issues  

---

## Firestore Structure

The app uses a single collection called `issues`.

Each issue contains:
- title
- description
- priority (Low / Medium / High)
- status (Open / In Progress / Done)
- assignedTo
- createdBy
- createdAt

---

## Similar Issue Handling

While creating an issue, the app checks for similar issue titles.  
If a similar issue already exists, the user is shown a warning and can choose to continue or cancel.

---

## Status Rule

An issue cannot be moved directly from **Open** to **Done**.  
It must first be moved to **In Progress**.

---

## Deployment

The application is deployed on Vercel and uses environment variables for Firebase configuration.
