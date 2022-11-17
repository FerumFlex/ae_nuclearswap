test:
	aeproject test

env:
	aeproject env

deploy:
	aecli contract deploy local.wallet '["USDT", 6, "USDT"]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token.json
	aecli contract deploy local.wallet '["0x9a63911a6495d76b36a94025c16847e4e6236b7a"]' --contractSource contracts/Gate.aes --descrPath ../src/src/contracts/ae_gate.json

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
