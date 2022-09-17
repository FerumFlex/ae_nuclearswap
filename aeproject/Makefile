test:
	aeproject test

env:
	aeproject env

deploy:
	aecli contract deploy local.wallet '["USDT", 6, "USDT", 1000000000]' --contractSource contracts/FungibleTokenFull.aes

# before this, please run
# git clone https://github.com/aeternity/aerepl.git
# cd aerepl
# make
# make docker
repl:
	docker run -i aeternity/aerepl:local
