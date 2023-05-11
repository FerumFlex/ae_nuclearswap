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

# Flow to deploy contracts and link them

1. Deploy ae
```
cd aeproject
make deploy_uat
make copy
```

2. Set ae owner. Copy ae gate contract to params for set_owner (aeproject/Makefile). Change ct_ to ak_
```
make set_owner_uat
```

3. Copy ae token address to truffle (truffle/migrations/2_deploy_gate.js)

4. Deploy truffle
```
cd truffle
make deploy_goerli
make copy
```

5. Copy eth token address to ae (aeproject/Makefile) and run
```
cd aeproject
make add_bridge
```



✅✅✅ DEPLOY COMPLETED ✅✅✅
✅✅✅ Ae token address: ct_qA5nCB1TYJRQqfD19duunNJv1dRkqqirKVynG3EvMBCGfZtXh
✅✅✅ Ae gate address: ct_2tADAnX2QvfhjW4xEJUUHicayMX464SEfdm2tKLoWYPGvdK5hd
✅✅✅ Eth token address: 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
✅✅✅ Eth gate address: 0x50bD2caDA1362b112d65145dD9D827Ec521a27b6

# First swap(not claimed) can be claimed by (ak_2QSYGGcpDBS69JrEQmL1ADVdqafBg3MtZ769ERwmHRRrgCLG2W)
Swap id 0xeffaf116a62db31b998ae8784eb87241edb52f5282e98949b541ce6bfd7301ce
signature 0x227b111fbcf8d4725a2e1714abfe9960ebfedef9001bd2e75498408768b9e4b96fb70e182a21d636b97120a34ea3ead7b6c5cbe3a1367d594def6dee09cad5be1b
