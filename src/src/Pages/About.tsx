import { Anchor, Stack, Paper } from "@mantine/core"


export function AboutPage() {
  return (
    <Stack align="center" justify="center" style={{backgroundColor: "unset", height: "100%"}}>
      <Paper withBorder radius="md" shadow="lg" p="md" style={{width: "500px", padding: "20px"}}>
        <h2>About</h2>
        <p>
            This project allows you to move your USDT tokens from Arbitrum One network to Aeternity network and vise versa.
        </p>
        <p>
            During development, we keep in mind that our product should be secure, fast, user friednly and keep low fees for transaction.
        </p>

        <p>That's why we selected Aeternity and Arbitrum One, they both provide very low fees.</p>

        <div>
            It participates in several hackathons
            <ul>
                <li><Anchor href="https://dao-fi-fusion-code-challenge.devpost.com/">DAO-Fi Fusion: The DAO and DeFi Code Challenge(in progress)</Anchor></li>
                <li><Anchor href="https://universe-two-haeckathon.devpost.com/">Æternity Universe Two Hæckathon (2nd place)</Anchor></li>
            </ul>
        </div>
      </Paper>
    </Stack>
  )
}
