import pathlib
import json
import os
import shutil
import subprocess


ORACLE_ADDRESS = "0x9a63911a6495d76b36a94025c16847e4e6236b7a"
AE_NETWORK = "ae_uat"  # could be: ae_uat, ae_mainnet
ETH_NETWORK = "arbitrum_goerli"  # could be: goerli, development, arbitrum_goerli

# computed fields
BASE = pathlib.Path(__file__).parent
ETH_NETWORK_IDS = {
    "goerli": "5",
    "development": "1337",
    "arbitrum_goerli": "421613"
}
ETH_NETWORK_ID = ETH_NETWORK_IDS[ETH_NETWORK]


def remove_if(path: pathlib.Path) -> bool:
    if os.path.exists(path):
        os.remove(path)
        return True
    return False

def replace(source: pathlib.Path, target: pathlib.Path) -> None:
    remove_if(target)
    shutil.copy(source, target)


ae_token_json_path = BASE / "src" / "src"/ "contracts"/ f"ae_token_{AE_NETWORK}.json"
ae_gate_json_path = BASE / "src" / "src"/ "contracts"/ f"ae_gate_{AE_NETWORK}.json"
eth_token_json_path = BASE / "truffle" / "build" / "USDT.json"
eth_gate_json_path = BASE / "truffle" / "build" / "Gate.json"

print("✅✅✅ Cleanup ...")
remove_if(ae_token_json_path)
remove_if(ae_gate_json_path)

print("✅✅✅ Deploy ae contracts")
subprocess.run(
    [
	    "aecli",
        "contract",
        "deploy",
        "local.wallet",
        "--networkId",
        AE_NETWORK,
        "[\"USDT\", 6, \"USDT\"]",
        "--contractSource",
        "contracts/FungibleTokenFull.aes",
        "--descrPath",
        ae_token_json_path.absolute(),
    ],
    cwd="aeproject",
    check=True,
)

subprocess.run(
    [
        "aecli",
        "contract",
        "deploy",
        "local.wallet",
        "--networkId",
        AE_NETWORK,
        f"[\"{ORACLE_ADDRESS}\"]",
        "--contractSource",
        "contracts/Gate.aes",
        "--descrPath",
        ae_gate_json_path.absolute(),
    ],
    cwd="aeproject",
    check=True,
)

replace(ae_token_json_path, BASE / "app" / "contracts" / f"ae_token_{AE_NETWORK}.json")
replace(ae_gate_json_path, BASE / "app" / "contracts" / f"ae_gate_{AE_NETWORK}.json")

with open(ae_token_json_path, mode="r") as f:
    ae_token_address = json.load(f)["address"]

with open(ae_gate_json_path, mode="r") as f:
    ae_gate_address = json.load(f)["address"]

# set owner
print("✅✅✅ Set owner")
subprocess.run(
    [
        "aecli",
        "contract",
        "call",
        "local.wallet",
        "--networkId",
        AE_NETWORK,
        "set_owner",
        f'["ak{ae_gate_address[2:]}"]',
        "--contractSource",
        "contracts/FungibleTokenFull.aes",
        "--descrPath",
        ae_token_json_path.absolute(),
    ],
    cwd="aeproject",
    check=True,
)

# deploy eth contracts
print("✅✅✅ Deploy eth contracts")

env = os.environ.copy()
subprocess.run(
    [
        "truffle",
        "migrate",
        "--network",
        ETH_NETWORK,
    ],
    env={
        "AE_TOKEN_ADDRESS": ae_token_address,
        "ORACLE_ADDRESS": ORACLE_ADDRESS,
        **env,
    },
    capture_output=True,
    cwd="truffle",
)

replace(eth_token_json_path, BASE / "src" / "src" / "contracts" / "USDT.json")
replace(eth_token_json_path, BASE / "app" / "contracts" / "USDT.json")

replace(eth_gate_json_path, BASE / "src" / "src" / "contracts" / "Gate.json")
replace(eth_gate_json_path, BASE / "app" / "contracts" / "Gate.json")

with open(eth_token_json_path, mode="r") as f:
    eth_token_address = json.load(f)["networks"][ETH_NETWORK_ID]["address"]

with open(eth_gate_json_path, mode="r") as f:
    eth_gate_address = json.load(f)["networks"][ETH_NETWORK_ID]["address"]

# add bridge for ae
print("✅✅✅ Add ae bridge")

subprocess.run(
    [
        "aecli",
        "contract",
        "call",
        "local.wallet",
        "--networkId",
        AE_NETWORK,
        "add_bridge",
        f'["{ae_token_address}", "{eth_token_address}"]',
        "--contractSource",
        "contracts/Gate.aes",
        "--descrPath",
        ae_gate_json_path.absolute(),
    ],
    cwd="aeproject",
    check=True,
)

# deploy completed
print("✅✅✅ DEPLOY COMPLETED ✅✅✅")
print(f"✅✅✅ Ae token address: {ae_token_address}")
print(f"✅✅✅ Ae gate address: {ae_gate_address}")
print(f"✅✅✅ Eth token address: {eth_token_address}")
print(f"✅✅✅ Eth gate address: {eth_gate_address}")
