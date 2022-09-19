test:
	aeproject test

env:
	aeproject env

deploy:
	rm ../src/src/contracts/ae_token.json || true
	rm ../app/contracts/ae_token.json || true
	aecli contract deploy local.wallet '["USDT", 6, "USDT", 1000000000]' --contractSource contracts/FungibleTokenFull.aes --descrPath ../src/src/contracts/ae_token.json
	cp ../src/src/contracts/ae_token.json ../app/contracts/ae_token.json

	rm ../src/src/contracts/ae_htlc.json || true
	rm ../app/contracts/ae_htlc.json || true
	aecli contract deploy local.wallet --contractSource contracts/HTLC.aes --descrPath ../src/src/contracts/ae_htlc.json
	cp ../src/src/contracts/ae_htlc.json ../app/contracts/ae_htlc.json

# before this, please run
# git clone https://github.com/aeternity/aerepl.git
# cd aerepl
# make
# make docker
repl:
	docker run -i aeternity/aerepl:local

address:
	aecli account address local.wallet