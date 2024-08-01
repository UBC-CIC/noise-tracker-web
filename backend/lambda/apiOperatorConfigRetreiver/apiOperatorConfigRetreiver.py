import os
import boto3
import json
import psycopg2
import psycopg2.extras
import uuid
import csv
import base64

def get_db_secret():
    db_secret_name = os.environ["SM_DB_CREDENTIALS"]
    # secretsmanager client to get db credentials
    sm_client = boto3.client("secretsmanager")
    response = sm_client.get_secret_value(SecretId=db_secret_name)["SecretString"]
    secret = json.loads(response)
    return secret


def get_config(operator_id):
    valid_uuid = str(uuid.UUID(operator_id))

    db_secret = get_db_secret()
    connection = psycopg2.connect(
        user=db_secret["username"],
        password=db_secret["password"],
        host=db_secret["host"],
        dbname=db_secret["dbname"],
    )
    cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

    get_hydrophone_ids = f"""
        SELECT h.hydrophone_id, h.sampling_frequency, h.directory, h.file_name, h.calibration_available
        FROM hydrophones h
        WHERE h.hydrophone_operator_id = %s;
    """

    cursor.execute(get_hydrophone_ids, (valid_uuid,))

    results = cursor.fetchall()
    if results == {}:
        raise Exception("No hydrophones found for the given operator ID.")
    return results


def get_calibration_data(hydrophone_id):
    calibration_data = {"frequency": [], "sensitivity": []}
    bucket = os.environ['BUCKET_NAME']
    object_name = f"{hydrophone_id}/calibration.csv"
    s3_client = boto3.client('s3')
    s3_client.download_file(bucket, object_name, '/tmp/calibration.csv')
    with open('/tmp/calibration.csv') as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            calibration_data["frequency"].append(row[0])
            calibration_data["sensitivity"].append(row[1])
    return calibration_data


def handler(event, context):
    operator_id = event['queryStringParameters']['operator_id']
    try:
        configs = get_config(operator_id)
    except ValueError:
        return {'statusCode': 400, 'body': 'Entered ID is not valid.'}
    except Exception as e:
        return {'statusCode': 400, 'body': str(e)}
    client_config = {"operator_id": operator_id, "hydrophones": [], "scan_interval": 5, "upload_interval": 5}

    for config in configs:
        hydrophone_config = {'id': config['hydrophone_id'], 'metrics': ['spl'],
                             'directory_to_watch': config['directory'], 'file_structure_pattern': config['file_name'],
                             'sample_rate': config['sampling_frequency']}
        if config['calibration_available']:
            try:
                hydrophone_config['calibration_curve'] = get_calibration_data(hydrophone_config['id'])
            except Exception:
                print(f"Could not find the calibration file for hydrophone: {hydrophone_config['id']}")
        client_config['hydrophones'].append(hydrophone_config)

    return {'statusCode': 200, 'body': base64.b64encode(json.dumps(client_config, indent=2).encode('utf-8'))}
