import { ThemeIcon, createStyles, Grid, Badge, Anchor } from '@mantine/core';
import { ReportMoney } from 'tabler-icons-react';
import { Link } from 'react-router-dom';


const useStyles = createStyles((theme) => ({
  logo: {
    margin: "1rem"
  }
}));


export function Logo() {
  const { classes } = useStyles();

  return (
    <Grid justify="center" align="center">
      <ThemeIcon className={classes.logo}>
        <ReportMoney size={48} strokeWidth={2} />
      </ThemeIcon>
      <Anchor component={Link} to="/" weight={"bold"}>aeRENITY</Anchor>
      &nbsp;
      <Badge color="blue" size="xs">beta</Badge>
    </Grid>
  );
}
