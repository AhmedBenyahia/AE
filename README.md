# Driving School managmenet system: Backend Repo [![Deployment](https://github.com/SlaySayto/AE/actions/workflows/main.yml/badge.svg)](https://github.com/SlaySayto/AE/actions/workflows/main.yml)
[DEMO](http://auto-ecole.tn.s3-website.eu-west-3.amazonaws.com/companies/60b802626730d700090951b2/dashboard)

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

 ## Clean, Beautiful and Responsive management system for driving school
 ![image](https://drive.google.com/uc?export=view&id=1iWnglYWDYpAVGYVMcQllSMjdlscad4So)



## About The Project

This project started as an end of study project and was build using Angular and NodeJs. But it wasn't well design and not responsive.
We decided to re-design the entire project and use a microserive architecture and Develope the frontend from scratch using ReactJs. For better performance. 
We tryed to follow Attribute-driven design (ADD) methodology when creating the software architecture because it takes into account the quality attributes of the software. Our knowladge of ADD came from the book [Designing Software Architectures: A Practical Approach](https://www.goodreads.com/book/show/27283384-designing-software-architectures). This is our first experience in implemention ADD in a project. An we may have missed some concept.

Our Main focus in this project is to deliver a hight quality product and create a well designed system using the technologie and following the  best practices. \ 
In the following, we will be detailing each the design iterations done and the decision made at each step. 


This repo contain the backend of the system.\
The [Frontend](https://github.com/SlaySayto/driving-schools-web-app) is in another repo.

## Build With


## Notes:
+ Make sure to use the latest node version 14+
+ Only run the two services below, the other will be added later
+ To import the Api form postmen, use this link: https://www.getpostman.com/collections/26c6a22a2f8d823ce2bc

## scheduling-service
Don't forget to set those env variable:
`PORT=3004;DEBUG=scheduling-service:*`
then run the server using `npm start`

## subscription-service
Same as the prev service
`PORT=3003;DEBUG=subscription-service:*`

## proxy-service and discovery-service
Those two services work together to provide dynamic routing of services url.
To see the different available routes see: http://localhost:8080/actuator/routes
(after running all services).

For example to execute a get all client request using the proxy: `GET:http://localhost:8080/subscription-service/client`

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/SlaySayto/AE.svg?style=for-the-badge
[contributors-url]: https://github.com/SlaySayto/AE/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/SlaySayto/AE.svg?style=for-the-badge
[forks-url]: https://github.com/SlaySayto/AE/network/members
[stars-shield]: https://img.shields.io/github/stars/SlaySayto/AE.svg?style=for-the-badge
[stars-url]: https://github.com/SlaySayto/AE/stargazers
[issues-shield]: https://img.shields.io/github/issues/SlaySayto/AE.svg?style=for-the-badge
[issues-url]: https://github.com/SlaySayto/AE/issues
[license-shield]: https://img.shields.io/github/license/SlaySayto/AE.svg?style=for-the-badge
[license-url]: https://github.com/SlaySayto/AE/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/ahmed-benyahia-ss
[product-screenshot]: images/screenshot.png

