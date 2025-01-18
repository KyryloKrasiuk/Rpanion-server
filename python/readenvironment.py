#!/usr/bin/env python3
"""
Read env params
"""

import json
from pathlib import Path

env_file = Path('/etc/environment')

env_vars = {}

if env_file.exists():
    with env_file.open() as file:
        for line in file:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                env_vars[key] = value

print(json.dumps(env_vars))