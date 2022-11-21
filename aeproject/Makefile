test:
	aeproject test

env:
	aeproject env --nodeVersion v6.6.0

deploy:
	rm ../src/src/contracts/ae_token.json || true
	rm ../src/src/contracts/ae_gate.json || true
	aecli contract deploy local.wallet '["USDT", 6, "USDT"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token.json
	aecli contract deploy local.wallet '["0x9a63911a6495d76b36a94025c16847e4e6236b7a"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate.json

set_owner:
	aecli contract call local.wallet set_owner '["ak_M4yd3Zh1W2WTqNrByT6pqFeu5kmkQXvFrDkBjhL1CbpTJ5Zxx"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token.json

add_bridge_dev:
	aecli contract call local.wallet add_bridge '["ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C", "0x9B874b6AEf778868C109a845342269989CC165B1"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate.json

add_bridge_goerli:
	aecli contract call local.wallet add_bridge '["ct_2HarwDyhRXXo1fqy6joNu4RePWsDb55gBKzvMpusBHc24hEp9C", "0x3684513152C4b4b3a1341Ba584B5A8c39a88f0b7"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate.json

copy:
	rm ../app/contracts/ae_token.json || true
	cp ../src/src/contracts/ae_token.json ../app/contracts/ae_token.json

	rm ../app/contracts/ae_gate.json || true
	cp ../src/src/contracts/ae_gate.json ../app/contracts/ae_gate.json

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
