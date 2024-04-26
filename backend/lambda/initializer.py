import os
import json
import boto3
import psycopg2
from psycopg2.extensions import AsIs
import secrets

DB_SECRET_NAME = os.environ["DB_SECRET_NAME"]
DB_USER_SECRET_NAME = os.environ["DB_USER_SECRET_NAME"]


def getDbSecret():
    # secretsmanager client to get db credentials
    sm_client = boto3.client("secretsmanager")
    response = sm_client.get_secret_value(SecretId=DB_SECRET_NAME)["SecretString"]
    secret = json.loads(response)
    return secret


dbSecret = getDbSecret()

connection = psycopg2.connect(
    user=dbSecret["username"],
    password=dbSecret["password"],
    host=dbSecret["host"],
    dbname=dbSecret["dbname"],
)

cursor = connection.cursor()

def handler(event, context):
    try:
        # Could be used for test
        delete_table = """
            DROP TABLE IF EXISTS hydrophone_operators;
            DROP TABLE IF EXISTS hydrophones;
        """
        cursor.execute(delete_table)
        connection.commit()

        #
        ## Create tables and schema
        ##

        # Created 3 tables based on the schema
        sqlTableCreation = """
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS "hydrophone_operators" (
                "hydrophone_operator_id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                "hydrophone_operator_name" varchar,
                "contact_name" varchar,
                "contact_email" varchar,
                "website" varchar,
                "in_directory" boolean
            );

            CREATE TABLE IF NOT EXISTS "hydrophones" (
                "hydrophone_id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                "hydrophone_operator_id" uuid,
                "site" varchar,
                "latitude" varchar,
                "longitude" varchar,
                "model" varchar,
                "mounting_type" varchar,
                "height_from_seafloor" varchar,
                "sampling_frequency" varchar,
                "depth" varchar,
                "first_deployment_date" varchar,
                "last_deployment_date" varchar,
                "range" varchar,
                "angle_of_view" varchar,
                "file_length" varchar,
                "file_format" varchar,
                "directory" varchar,
                "file_name" varchar,
                "timezone" varchar,
                "storage_interval" varchar,
                "last_data_upload" varchar,
                "calibration_available" boolean,
                "average_spl" jsonb
            );
        """

        #
        ## Create user with limited permission on RDS
        ##

        # Execute table creation
        cursor.execute(sqlTableCreation)
        connection.commit()

        # Generate 16 bytes username and password randomly
        username = secrets.token_hex(8)
        password = secrets.token_hex(16)

        # Based on the observation,
        #   - Database name: does not reflect from the CDK dbname read more from https://stackoverflow.com/questions/51014647/aws-postgres-db-does-not-exist-when-connecting-with-pg
        #   - Schema: uses the default schema 'public' in all tables
        #
        # Create new user with the following permission:
        #   - SELECT
        #   - INSERT
        #   - UPDATE
        #   - DELETE

        # comment out to 'connection.commit()' on redeployment
        sqlCreateUser = """
            DO $$
            BEGIN
                CREATE ROLE readwrite;
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Role already exists.';
            END
            $$;

            GRANT CONNECT ON DATABASE postgres TO readwrite;

            GRANT USAGE, CREATE ON SCHEMA public TO readwrite;
            GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO readwrite;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO readwrite;
            GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO readwrite;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO readwrite;

            CREATE USER "%s" WITH PASSWORD '%s';
            GRANT readwrite TO "%s";
        """

        # Execute table creation
        cursor.execute(
            sqlCreateUser,
            (
                AsIs(username),
                AsIs(password),
                AsIs(username),
            ),
        )
        connection.commit()

        #
        ## Load client username and password to SSM
        ##
        authInfo = {"username": username, "password": password}

        # comment out to on redeployment
        dbSecret.update(authInfo)
        sm_client = boto3.client("secretsmanager")
        sm_client.put_secret_value(
            SecretId=DB_USER_SECRET_NAME, SecretString=json.dumps(dbSecret)
        )

        # Close cursor and connection
        cursor.close()
        connection.close()

    except Exception as e:
        print(e)