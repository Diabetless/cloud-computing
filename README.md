<p align="center">
  <img src="https://github.com/Diabetless/.github/blob/main/assets/Diabetless%20Logo.png" alt="Konva logo" height="180" />
</p>

<h1 align="center">Diabetless Web Service</h1>

Diabetless web service is a collection of web services that have features like user authentication, content authorization, predict food, etc. Some of the endpoints require authorization using 
JWT(JSON Web Token). You need to login to access the service. The login is using email and password. If you don't have an account you can register to gain access to these services.

One of the cool features of this web service is predicting food by uploading food image. Once uploaded, user can see the food name and its nutrition fact such as glycemic index, glycemic load, protein,
carbohydrates, and more.

<h3>Architecture</h3>

![architecture](https://github.com/Diabetless/cloud-computing/assets/101824833/4d702cac-ffb2-4fdf-8c87-adb73e06e804)

This web services has two service available which is:
- backend
  <br/> base URL: https://backend-sggimrersq-et.a.run.app/
  <br/>If you want to see all of the features of the backend service you can visit the <a href="https://backend-sggimrersq-et.a.run.app/api-docs/">API DOCUMENTATION LINK</a>.
- deployed-model
  <br/> base URL: https://deployed-model-sggimrersq-et.a.run.app
  <br/>If you want to see all of the features of the deployed-ml service you can visit the <a href="https://deployed-model-sggimrersq-et.a.run.app/api-docs">API DOCUMENTATION LINK</a>.

<h2>Backend Web Service</h2>

This repository is the repository of the backend service.

Endpoints available:
- User_Account
  <pre>POST /users/register (Register a new user)</pre>
  <pre>POST /users/login (User login)</pre>
  <pre>GET /users (Fetch user account data)</pre>
  <pre>PUT /users/edit-profile (Edit user's profile)</pre>
  <pre>PUT /users/edit-password (Edit user's password)</pre>
  <pre>PUT /users/profile-picture (Edit user's profile picture)</pre>
- Articles
  <pre>GET /articles (Fetch all articles)</pre>
  <pre>POST /articles (Post new articles)</pre>
  <pre>GET /articles/{id} (Fetch specific article)</pre>
  <pre>PUT /articles/{id} (Update the existing article)</pre>
- Meals
  <pre>GET /meals (Fetch all meals)</pre>
  <pre>POST /meals (Create a new meal)</pre>
  <pre>GET /meals/{id} (Get specific meal)</pre>
  <pre>PUT /meals/{id} (Update the existing meal)</pre>
- Personal_Health
  <pre>GET /users/health (Get user bmi & blood sugar data)</pre>
  <pre>POST /users/bmi (Post current user's BMI data)</pre>
  <pre>DELETE /users/bmi/{id} (Delete the BMI data users by id)</pre>
  <pre>POST /users/blood-sugar (Post current blood sugar user's data)</pre>
  <pre>DELETE /users/blood-sugar/{id} (Delete the blood sugar data users by id)</pre>

We have created the API Documentation for this service based on OPEN API specification. If you want to visit/see full API Documentation of this service you can visit this link: https://backend-sggimrersq-et.a.run.app/api-docs/
<br/>
![image](https://github.com/Diabetless/cloud-computing/assets/101824833/090ca066-c139-4259-ad83-8ae338c7cbc4)

<h3>Instructions</h3>
