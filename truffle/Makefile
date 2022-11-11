deploy:
	truffle deploy

deploy-goerli:
	truffle migrate --network goerli --reset

copy:
	rm ../src/src/contracts/Gate.json || true
	rm ../src/src/contracts/USDT.json || true
	cp ./build/Gate.json ../src/src/contracts/Gate.json
	cp ./build/USDT.json ../src/src/contracts/USDT.json

networks:
	truffle networks

.PHONY: test
test:
	truffle test

compile:
	truffle compile

buffer:
	node bytes.js