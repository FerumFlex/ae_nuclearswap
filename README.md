# Nuclearswap (for aeternity hack)

Allow to crosschain exchange tokens like USDT, USDC and other using HTLC contracts()

Approximately it looks like:

![htlc flow](docs/htlc.png "Htlc")

more information about HTLC you can read

- https://www.researchgate.net/figure/Hash-time-lock-contract-HTLC_fig1_346143775
- https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc

# setup things
```
cd aeproject
npm install
aeproject env
aecli account create local.wallet
```

# deploy aeternity contracts

```
cd aeproject
make deploy
```

# run aeternity contract tests

```
cd aeproject
make test
```

# start react app

```
cd src
npm start
```

# deploy truffle contracts

TBD: