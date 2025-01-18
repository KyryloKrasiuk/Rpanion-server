#!/usr/bin/env python3
"""
Output the current NetBird config in json format
"""

import os
import json
import subprocess
from pathlib import Path

env_file = Path('/etc/environment')

info = {}

if env_file.exists():
    env_vars = {}

    with env_file.open() as file:
        for line in file:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                env_vars[key] = value

    info['config'] = env_vars

try:
    result = subprocess.run(
        ["netbird", "status", "--json"],
        capture_output=True,
        text=True,
        check=True
    )
    status_data = result.stdout
except subprocess.CalledProcessError as e:
    print(f"Error running command: {e}")
    status_data = ""

info['status'] = json.loads(status_data)

print(json.dumps(info))
