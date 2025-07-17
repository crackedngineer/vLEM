import json
import base64


def encode_base64(data: str) -> str:
    encoded_bytes = base64.b64encode(data.encode("utf-8"))
    return encoded_bytes.decode("utf-8")


def decode_base64(encoded_data: str) -> str:
    decoded_bytes = base64.b64decode(encoded_data.encode("utf-8"))
    return decoded_bytes.decode("utf-8")

def read_json(file_path: str) -> dict:
    """
    Reads a JSON file and returns its content as a dictionary.
    Raises an exception if the file does not exist or is not valid JSON.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"File '{file_path}' not found.")
    except json.JSONDecodeError:
        raise ValueError(f"File '{file_path}' is not valid JSON.")