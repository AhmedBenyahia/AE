# AE
adaptation of micro-service architecture in auto-ecole. tn project


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

