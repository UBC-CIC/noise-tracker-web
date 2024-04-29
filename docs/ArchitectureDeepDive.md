# Architecture Deep Dive

## Architecture

![Archnitecture Diagram](./images/architectureDeepDive/architecture_diagram.png)

## Description
### Web Application
1. The user sends a request to a Cloudfront Distribution with caching enabled. If there is a cache hit, CloudFront returns the cached data. The Web Application Firewall (WAF) will ensure that general security protection is enforced. Further explanation of what is being protected can be found in the CDK stack.
2. On a cache miss, Cloudfront will send a request to an Application Load Balancer (ALB).
3. The ALB checks the health status of the container. If the status is healthy, it forwards the request to the container which runs on Elastic Container Service (ECS). The ECS loads an image file that contains the web app from a repository in the Elastic Container Registry (ECR). The image file is used to run on a container as an ECS task using Fargate, a serverless compute engine for containers. If a task fails, the ECS Service will redeploy a new task.
4. When an admin or operator user logs in to the web app, the web app will forward the authentication to Cognito. Upon successful authentication, a token (JSON Web Token (JWT)) is returned.
5. The web app then makes requests to various endpoints on the API Gateway. 
6. Each request is passed with the JWT token that will trigger a Lambda Authorizer to check if the user is in an authorized user group (admin or operator). 

### Cloud Backend
7. Upon successful authentication, the API Gateway will forward the request to one of the lambda integrations.
8. For requests related to RDS, the lambda integration will make a PostgreSQL (PSQL) call to RDS using Postgres and return the data accordingly.
9. For requests related to S3, the lambda integration will request to get objects from S3 and return data accordingly.
10. Once a day, the average monthly spl values are calculated using data from S3 and are stored in the database.
11. Once a day, the 1-minute interval spectrograms are combined into a single daily spectrogram which is stored in S3.
12. Each hour, the 1-minute interval spl data is combined into hourly spl values which are stored in S3.  
13. When an admin creates a new operator using the admin dashboard, a new user is created in the Cognito user pool.

### Client Software
14. Client software fetched the hydrophone details and configurations by calling an API endpoint. This endpoint invokes a lambda function (7) that fetches the details from the Noise Tracker Database (8).
15. The client application also needs to upload the analysis results into the cloud, which is done by uploading JSON files in the Noise Tracker S3 Bucket.

## Database Schema

![Database Schema](./images/architectureDeepDive/database_schema.png)

### `hydrophone_operators` table

| Column Name | Description 
| ----------- | ----------- 
| hydrophone_operator_id | The uuid of the hydrophone operator
| hydrophone_operator_name | The name of the hydrophone operator's organization
| contact_name | The name of the organization contact 
| contact_email | The email address of the organization contact
| website | The organization's website
| in_directory | Whether or not the organization is opted into sharing their contact information in the operator directory


### `hydrophones` table

| Column Name | Description 
| ----------- | ----------- 
| hydrophone_id | The uuid of the hydrophone
| hydrophone_operator_id |  The uuid of the hydrophone's associated hydrophone operator
| site | The name of the hydrophone site
| latitude | The latitude of the hydrophone
| longitude | The longitude of the hydrophone
| model | The model of the hydrophone
| mounting_type | The mounting type of the hydrophone
| height_from_seafloor | The height of the hydrophone above the seafloor in meters
| sampling_frequency | The sampling frequency of the hydrophone in kilohertz
| depth | The depth of the hydrophone in meters
| first_deployment_date | The date that the hydrophone was first deployed
| last_deployment_date | The date that the hydrophone was most recently deployed
| range | The range of the hydrophone in meters
| angle_of_view | The hydrophone's angle of view in degrees
| file_length | The length of audio files in minutes 
| file_format | The format of the audio file
| directory | The directory that the audio files are stored in on the hydrophone operator's system 
| file_name | The format of file names 
| timezone | The timezone of the hydrophone
| storage_interval | How often files are stored
| calibration_available | Whether or not calibration data is available for the hydrophone 
| average_spl | Average monthly sound pressure level values, calculated daily


