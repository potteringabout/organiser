from sqlmodel import create_engine, SQLModel, Session
from contextlib import contextmanager 
import os
import boto3
import json
from sqlalchemy import text

# 👇 Secret is fetched once per warm container
db_secret = None


def get_secret():
    global db_secret
    if db_secret is None:
        secret_arn = os.environ["DB_SECRET_ARN"]
        client = boto3.client("secretsmanager")
        response = client.get_secret_value(SecretId=secret_arn)
        db_secret = json.loads(response["SecretString"])
    return db_secret["username"], db_secret["password"]


host = os.environ["DB_HOST"]
port = os.environ["DB_PORT"]
dbname = os.environ["DB_NAME"]
#username, password = get_secret()
username = os.environ["DB_USERNAME"]
password = os.environ["DB_PASSWORD"]

engine = create_engine(f"postgresql://{username}:{password}@{host}:{port}/{dbname}", echo=False)


def drop_db():
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()

#def drop_db():
#    SQLModel.metadata.drop_all(engine)


def init_db():
    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session():
    with Session(engine) as session:
        yield session
