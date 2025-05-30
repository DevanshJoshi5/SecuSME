from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
import pymongo
import subprocess
import os
import stat
import re
import bcrypt
import subprocess
import re
import uuid
import json
from datetime import datetime

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

# Configure CORS to allow requests from http://localhost:3000, including preflight (OPTIONS) requests
CORS(app, supports_credentials=True, origins=["https://secusme.vercel.app"])

client = pymongo.MongoClient("mongodb+srv://admin:admin123@cluster0.vderj.mongodb.net/secusme?retryWrites=true&w=majority&appName=Cluster0")
db = client["secusme"]
users_collection = db["users"]
results_collection = db["results"]

SCAN_DIRECTORY = "C:\\Users\\DELL\\Downloads\\Eichartest"# For testing; change to a relevant directory in production

# Patterns for sensitive data (e.g., credit card numbers, API keys)
SENSITIVE_PATTERNS = [
    r'\b\d{4}-\d{4}-\d{4}-\d{4}\b',  # Credit card number (e.g., 1234-5678-9012-3456)
    r'\b[A-Za-z0-9]{32}\b',          # API key (e.g., 32-character alphanumeric string)
    r'\bpassword\s*=\s*[\S]+\b',     # Password in config files (e.g., password=secret)
]

def run_clamav_scan():
    """Run ClamAV scan on the specified directory and return the number of infected files."""
    try:
        # Run clamscan (adjust path if needed for Windows or different setups)
        result = subprocess.check_output(
            ['clamscan', '-r', SCAN_DIRECTORY, '--bell', '-i'],
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        # Parse the output for infected files
        infected_count = 0
        for line in result.splitlines():
            if "Infected files:" in line:
                infected_count = int(line.split(":")[1].strip())
                break
        return infected_count
    except subprocess.CalledProcessError as e:
        print(f"ClamAV scan failed: {e.output}")
        return 0
    except Exception as e:
        print(f"ClamAV scan error: {e}")
        return 0

def check_sensitive_data():
    """Check for sensitive data in files and return the number of files with sensitive data."""
    sensitive_files = 0
    for root, _, files in os.walk(SCAN_DIRECTORY):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for pattern in SENSITIVE_PATTERNS:
                        if re.search(pattern, content):
                            sensitive_files += 1
                            print(f"Sensitive data found in: {file_path}")
                            break  # Count the file once even if multiple patterns match
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
    return sensitive_files

def check_file_permissions():
    """Check for overly permissive file permissions and return the number of risky files."""
    risky_files = 0
    for root, _, files in os.walk(SCAN_DIRECTORY):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                file_stat = os.stat(file_path)
                mode = file_stat.st_mode
                # Check if file is world-readable (0o004) or world-writable (0o002)
                if (mode & stat.S_IROTH) or (mode & stat.S_IWOTH):
                    risky_files += 1
                    print(f"Overly permissive permissions on: {file_path} (mode: {oct(mode)})")
            except Exception as e:
                print(f"Error checking permissions for {file_path}: {e}")
    return risky_files

def check_encryption():
    """Check if sensitive files are encrypted (simplified check). Returns 1 if unencrypted files found."""
    # For simplicity, assume files with sensitive data should be encrypted
    # In a real implementation, you might check for encryption metadata or file extensions
    sensitive_files = check_sensitive_data()
    if sensitive_files > 0:
        # Assume files are unencrypted unless proven otherwise (simplified for this example)
        print("Unencrypted sensitive files detected.")
        return 1
    return 0

@app.route('/api/scan/data', methods=['POST'])
@jwt_required()
def scan_data():
    user_id = get_jwt_identity()
    data = request.get_json()
    session_id = data.get('session_id', 'default_session')

    # Log request details
    print(f"Data Scan Request Headers: {request.headers}")
    print(f"Data Scan Request Body: {data}")
    print(f"User ID: {user_id}")

    print("Running data security scan...")

    # Step 1: Run ClamAV scan for malware
    infected_files = run_clamav_scan()
    malware_points = min(4.0, infected_files * 2.0)  # 2.0 points per infected file, capped at 4.0
    print(f"Malware scan: {infected_files} infected files found, points: {malware_points}")

    # Step 2: Check for sensitive data exposure
    sensitive_files = check_sensitive_data()
    sensitive_data_points = min(3.0, sensitive_files * 1.0)  # 1.0 point per file, capped at 3.0
    print(f"Sensitive data scan: {sensitive_files} files with sensitive data, points: {sensitive_data_points}")

    # Step 3: Check for overly permissive file permissions
    risky_files = check_file_permissions()
    permission_points = min(2.0, risky_files * 1.0)  # 1.0 point per file, capped at 2.0
    print(f"Permissions scan: {risky_files} files with risky permissions, points: {permission_points}")

    # Step 4: Check for lack of encryption
    encryption_penalty = check_encryption() * 1.0  # 1.0 point if unencrypted files found
    print(f"Encryption check: {'Unencrypted files found' if encryption_penalty else 'No unencrypted files'}, penalty: {encryption_penalty}")

    # Step 5: Calculate total data security score
    data_score = malware_points + sensitive_data_points + permission_points + encryption_penalty
    data_score = min(10.0, data_score)  # Cap at 10.0
    print(f"Calculated data score: {data_score}")

    # Save the result to MongoDB
    results_collection.update_one(
        {'user_id': user_id, 'session_id': session_id},
        {'$set': {'data_score': data_score}},
        upsert=True
    )
    print(f"Saved scan result: user_id={user_id}, session_id={session_id}, data_score={data_score}")

    return jsonify({'status': 'success', 'data_score': data_score}), 200

try:
    client.server_info()
    print("Connected to MongoDB Atlas successfully!", flush=True)
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {e}", flush=True)

print("Starting Flask server with debug logging...", flush=True)

def run_command(command):
    try:
        result = subprocess.run(command, shell=False, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
        return result.stdout.decode('utf-8')
    except Exception as e:
        return f"Error: {str(e)}"

def scan_network():
    try:
        print("Running Nmap scan...", flush=True)
        output = run_command(['nmap', '-sV', 'localhost'])
        open_ports = len(re.findall(r'\d+/tcp\s+open', output))
        score = max(0, 10 - open_ports * 1.5)  # Adjusted scoring: more open ports = lower score
        print(f"Nmap output: {output}", flush=True)
        print(f"Calculated network score: {score}", flush=True)
        return score
    except Exception as e:
        print(f"Network scan failed: {str(e)}", flush=True)
        return 7.5  # Fallback score for demo

def scan_endpoint():
    try:
        print("Running osquery scan...", flush=True)
        output = run_command(['osqueryi', '--json', 'SELECT * FROM processes WHERE uid=0'])
        root_processes = len(re.findall(r'"uid":\s*"0"', output))
        score = max(0, 10 - root_processes * 2)  # Adjusted scoring: more root processes = lower score
        print(f"osquery output: {output}", flush=True)
        print(f"Calculated endpoint score: {score}", flush=True)
        return score
    except Exception as e:
        print(f"Endpoint scan failed: {str(e)}", flush=True)
        return 0  # Fallback score for demo

def scan_data():
    print("Running data scan (placeholder)...", flush=True)
    return 4

@app.route('/api/scan/network', methods=['POST'])
@jwt_required()
def api_scan_network():
    print("Entering /api/scan/network endpoint", flush=True)
    data = request.get_json(silent=True)
    print("Network Scan Request Headers:", request.headers, flush=True)
    print("Network Scan Request Body:", data, flush=True)
    try:
        user_id = get_jwt_identity()
        print("User ID:", user_id, flush=True)
        session_id = data.get('session_id', str(uuid.uuid4()))
        score = scan_network()
        save_scan_result(user_id, session_id, network_score=score)
        print(f"Network Scan Success: Score = {score}", flush=True)
        return jsonify({'session_id': session_id, 'score': score}), 200
    except Exception as e:
        print(f"Network Scan Error: {str(e)}", flush=True)
        return jsonify({'error': str(e)}), 422

@app.route('/api/scan/endpoint', methods=['POST'])
@jwt_required()
def scan_endpoint():
    user_id = get_jwt_identity()
    data = request.get_json()
    session_id = data.get('session_id', 'default_session')

    # Log request details
    print(f"Endpoint Scan Request Headers: {request.headers}")
    print(f"Endpoint Scan Request Body: {data}")
    print(f"User ID: {user_id}")

    print("Running PowerShell scan to find elevated processes...")
    try:
        # Use PowerShell to find elevated processes on Windows
        ps_command = (
            'Get-Process | Where-Object {$_.UserName -like "*SYSTEM*" -or $_.UserName -like "*Administrator*"} | '
            'Select-Object Id, ProcessName, Path | ConvertTo-Json'
        )
        ps_output = subprocess.check_output(
            ['powershell', '-Command', ps_command],
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        print(f"PowerShell output: {ps_output}")

        # Parse the JSON output
        try:
            processes = json.loads(ps_output)
            # If the output is a single object (not a list), wrap it in a list
            if isinstance(processes, dict):
                processes = [processes]
        except json.JSONDecodeError as e:
            print(f"Failed to parse PowerShell output as JSON: {e}")
            processes = []

        # Log details of elevated processes
        if processes:
            print("Elevated processes found:")
            for proc in processes:
                print(f" - PID: {proc['Id']}, Name: {proc['ProcessName']}, Path: {proc.get('Path', 'N/A')}")
        else:
            print("No elevated processes found.")

        # Count the number of elevated processes
        elevated_process_count = len(processes)
        print(f"Number of elevated processes: {elevated_process_count}")

        # Calculate endpoint score: 1.0 point per elevated process, capped at 10
        endpoint_score = min(10.0, elevated_process_count * 1.0)
        print(f"Calculated endpoint score: {endpoint_score}")

        # Save the result to MongoDB
        results_collection.update_one(
            {'user_id': user_id, 'session_id': session_id},
            {'$set': {'endpoint_score': endpoint_score}},
            upsert=True
        )
        print(f"Saved scan result: user_id={user_id}, session_id={session_id}, endpoint_score={endpoint_score}")

        return jsonify({'status': 'success', 'endpoint_score': endpoint_score}), 200

    except subprocess.CalledProcessError as e:
        print(f"PowerShell scan failed: {e.output}")
        # Instead of failing, return a score of 0 and log the error
        endpoint_score = 0.0
        results_collection.update_one(
            {'user_id': user_id, 'session_id': session_id},
            {'$set': {'endpoint_score': endpoint_score}},
            upsert=True
        )
        print(f"Saved scan result: user_id={user_id}, session_id={session_id}, endpoint_score={endpoint_score}")
        return jsonify({'status': 'success', 'endpoint_score': endpoint_score, 'warning': 'PowerShell scan failed, defaulting to score 0'}), 200

    except Exception as e:
        print(f"PowerShell scan error: {e}")
        # Instead of failing, return a score of 0 and log the error
        endpoint_score = 0.0
        results_collection.update_one(
            {'user_id': user_id, 'session_id': session_id},
            {'$set': {'endpoint_score': endpoint_score}},
            upsert=True
        )
        print(f"Saved scan result: user_id={user_id}, session_id={session_id}, endpoint_score={endpoint_score}")
        return jsonify({'status': 'success', 'endpoint_score': endpoint_score, 'warning': 'PowerShell scan error, defaulting to score 0'}), 200
@app.route('/api/scan/data', methods=['POST'])
@jwt_required()
def api_scan_data():
    print("Data Scan Request Headers:", request.headers, flush=True)
    data = request.get_json(silent=True)
    if data is None:
        print("Data Scan: No JSON body received", flush=True)
        return jsonify({'error': 'No JSON body provided'}), 422
    print("Data Scan Request Body:", data, flush=True)
    try:
        user_id = get_jwt_identity()
        print("User ID:", user_id, flush=True)
        session_id = data.get('session_id', str(uuid.uuid4()))
        score = scan_data()
        save_scan_result(user_id, session_id, data_score=score)
        print(f"Data Scan Success: Score = {score}", flush=True)
        return jsonify({'session_id': session_id, 'data_score': score}), 200
    except Exception as e:
        print(f"Data Scan Error: {str(e)}", flush=True)
        return jsonify({'error': str(e)}), 422

@app.route('/api/scan/results', methods=['GET', 'OPTIONS'])
def get_scan_results():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    # Require JWT for the actual GET request
    @jwt_required()
    def handle_get():
        print("Get Scan Results Request Headers:", request.headers, flush=True)
        try:
            user_id = get_jwt_identity()
            session_id = request.args.get('session_id')
            print(f"Fetching scan results for user_id={user_id}, session_id={session_id}", flush=True)
            if not session_id:
                return jsonify({'error': 'Session ID required'}), 400

            result = results_collection.find_one({'user_id': user_id, 'session_id': session_id})
            if not result:
                print(f"No scan results found for user_id={user_id}, 'session_id={session_id}", flush=True)
                return jsonify({'error': 'No scan results found for this session'}), 404

            print(f"Found scan results: {result}", flush=True)
            return jsonify({
                'network': result.get('network_score', 0),
                'endpoint': result.get('endpoint_score', 0),
                'data': result.get('data_score', 0),
            }), 200
        except Exception as e:
            print(f"Get Scan Results Error: {str(e)}", flush=True)
            return jsonify({'error': str(e)}), 422

    return handle_get()
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    company_name = data.get('companyName')
    email = data.get('email')
    contact_number = data.get('contactNumber')
    username = data.get('username')
    password = data.get('password')
    
    if not all([company_name, email, contact_number, username, password]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if users_collection.find_one({'username': username}):
        return jsonify({'error': 'Username already exists'}), 400
    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_collection.insert_one({
        'companyName': company_name,
        'email': email,
        'contactNumber': contact_number,
        'username': username,
        'password': hashed
    })
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    print(f"Login attempt: username={username}", flush=True)
    user = users_collection.find_one({'username': username})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        access_token = create_access_token(identity=str(user['_id']))
        print(f"Login successful: token={access_token}", flush=True)
        return jsonify({'access_token': access_token}), 200
    print("Login failed: Invalid credentials", flush=True)
    return jsonify({'error': 'Invalid credentials'}), 401

def save_scan_result(user_id, session_id, network_score=None, endpoint_score=None, data_score=None):
    existing = results_collection.find_one({'user_id': user_id, 'session_id': session_id})
    if existing:
        update_data = {}
        if network_score is not None: update_data['network_score'] = network_score
        if endpoint_score is not None: update_data['endpoint_score'] = endpoint_score
        if data_score is not None: update_data['data_score'] = data_score
        results_collection.update_one(
            {'user_id': user_id, 'session_id': session_id},
            {'$set': update_data}
        )
    else:
        results_collection.insert_one({
            'user_id': user_id,
            'session_id': session_id,
            'network_score': network_score if network_score is not None else 0,
            'endpoint_score': endpoint_score if endpoint_score is not None else 0,
            'data_score': data_score if data_score is not None else 0,
            'created_at': datetime.now()
        })
    print(f"Saved scan result: user_id={user_id}, session_id={session_id}, network_score={network_score}, endpoint_score={endpoint_score}, data_score={data_score}", flush=True)

@app.route('/api/save_results', methods=['POST'])
@jwt_required()
def save_results():
    print("Save Results Request Headers:", request.headers, flush=True)
    data = request.get_json(silent=True)
    if data is None:
        print("Save Results: No JSON body received", flush=True)
        return jsonify({'error': 'No JSON body provided'}), 422
    print("Save Results Request Body:", data, flush=True)
    try:
        user_id = get_jwt_identity()
        session_id = data.get('session_id')
        questionnaire_score = data.get('questionnaire_score')
        final_score = data.get('final_score')
        if not session_id:
            return jsonify({'error': 'Missing required field: session_id'}), 422
        update_data = {}
        if questionnaire_score is not None:
            update_data['questionnaire_score'] = questionnaire_score
        if final_score is not None:
            update_data['final_score'] = final_score
        results_collection.update_one(
            {'user_id': user_id, 'session_id': session_id},
            {'$set': update_data},
            upsert=True
        )
        print(f"Saved results: user_id={user_id}, session_id={session_id}, questionnaire_score={questionnaire_score}, final_score={final_score}", flush=True)
        return jsonify({'message': 'Results saved'}), 200
    except Exception as e:
        print(f"Save Results Error: {str(e)}", flush=True)
        return jsonify({'error': str(e)}), 422

@app.route('/api/get_results', methods=['GET'])
@jwt_required()
def get_results():
    user_id = get_jwt_identity()
    results = results_collection.find({'user_id': user_id})
    return jsonify([{
        'session_id': r['session_id'],
        'network_score': r.get('network_score', 0),
        'endpoint_score': r.get('endpoint_score', 0),
        'data_score': r.get('data_score', 0),
        'questionnaire_score': r.get('questionnaire_score', 0),
        'final_score': r.get('final_score', 0),
        'created_at': r['created_at'].isoformat()
    } for r in results])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
