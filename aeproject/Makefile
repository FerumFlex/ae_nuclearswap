.PHONY: test
test:
	aeproject test

env:
	aeproject env

deploy_uat:
	rm ../src/src/contracts/ae_token_ae_uat.json || true
	rm ../src/src/contracts/ae_gate_ae_uat.json || true
	aecli contract deploy local.wallet --networkId ae_uat '["USDT", 6, "USDT"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token_ae_uat.json
	aecli contract deploy local.wallet --networkId ae_uat '["0x9a63911a6495d76b36a94025c16847e4e6236b7a"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate_ae_uat.json

deploy_prod:
	rm ../src/src/contracts/ae_token_ae_mainnet.json || true
	rm ../src/src/contracts/ae_gate_ae_mainnet.json || true
	aecli contract deploy local.wallet --networkId ae_mainnet '["USDT", 6, "USDT"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token_ae_mainnet.json
	aecli contract deploy local.wallet --networkId ae_mainnet '["0x9a63911a6495d76b36a94025c16847e4e6236b7a"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate_ae_mainnet.json

set_owner_uat:
	aecli contract call local.wallet --networkId ae_uat set_owner '["ak_28VkswFZoJE5EPEoq53uMzt444LjVi4BGZmd7L6guaXfrnJVQJ"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token_ae_uat.json

set_owner_prod:
	aecli contract call local.wallet --networkId ae_mainnet set_owner '["ak_M4yd3Zh1W2WTqNrByT6pqFeu5kmkQXvFrDkBjhL1CbpTJ5Zxx"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token_ae_mainnet.json

add_bridge_dev:
	aecli contract call local.wallet --networkId ae_uat add_bridge '["ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C", "0x9B874b6AEf778868C109a845342269989CC165B1"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate_ae_uat.json

add_bridge_goerli:
	aecli contract call local.wallet --networkId ae_uat add_bridge '["ct_2bY8m1R7tonzWH1387xPRBpUrVq4Fv5KWphXijUfe6dEqYEm1y", "0x6817A3dB311d0635085679aAC60D3E48be6cB1bB"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate_ae_uat.json

add_bridge_prod:
	aecli contract call local.wallet --networkId ae_mainnet add_bridge '["ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C", "0x3684513152C4b4b3a1341Ba584B5A8c39a88f0b7"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate_ae_mainnet.json

copy_uat:
	rm ../app/contracts/ae_token_ae_uat.json || true
	cp ../src/src/contracts/ae_token_ae_uat.json ../app/contracts/ae_token_ae_uat.json

	rm ../app/contracts/ae_gate_ae_uat.json || true
	cp ../src/src/contracts/ae_gate_ae_uat.json ../app/contracts/ae_gate_ae_uat.json

copy_prod:
	rm ../app/contracts/ae_token_ae_mainnet.json || true
	cp ../src/src/contracts/ae_token_ae_mainnet.json ../app/contracts/ae_token_ae_mainnet.json

	rm ../app/contracts/ae_gate_ae_uat.json || true
	cp ../src/src/contracts/ae_gate_ae_mainnet.json ../app/contracts/ae_gate_ae_mainnet.json

# before this, please run
# git clone https://github.com/aeternity/aerepl.git
# cd aerepl
# make
# make docker
repl:
	docker run --rm -i aeternity/aerepl:local

create:
	aecli account create local.wallet

address:
	aecli account address local.wallet

balance:
	aecli account balance local.wallet
