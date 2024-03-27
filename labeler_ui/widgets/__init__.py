from pathlib import Path

import ipykernel

connection_file = Path(ipykernel.get_connection_file()).stem
KERNEL_ID = connection_file.split("-", 1)[1]
