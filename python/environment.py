#!/usr/bin/env python3
"""
Save env param to file
"""

import os
import sys

# Check for correct number of arguments
if len(sys.argv) != 3:
    print("Usage: sudo python3 environment.py <key> <value>")
    sys.exit(1)

# Get key and value from command-line arguments
var_name = sys.argv[1]
var_value = sys.argv[2]

# Path to the /etc/environment file
env_file = "/etc/environment"

try:
    # Ensure the file exists; create if it doesn't
    if not os.path.exists(env_file):
        print(f"{env_file} does not exist. Creating it...")
        with open(env_file, "w") as file:
            file.write("")  # Create an empty file

    # Read the current contents of /etc/environment
    with open(env_file, "r") as file:
        lines = file.readlines()

    # Check if the variable exists and update it
    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f'{var_name}='):
            lines[i] = f'{var_name}={var_value}\n'
            updated = True
            break

    # If the variable doesn't exist, add it
    if not updated:
        lines.append(f'{var_name}={var_value}\n')

    # Write the updated contents back to /etc/environment
    with open(env_file, "w") as file:
        file.writelines(lines)

    print(f"Environment variable {var_name} has been set to: {var_value}")

except PermissionError:
    print("Error: Permission denied. Please run the script with sudo.")
    sys.exit(1)

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
