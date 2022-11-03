import { Text, ThemeIcon, createStyles, Grid } from '@mantine/core';
import { ReportMoney } from 'tabler-icons-react';


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
      <Text weight={"bold"}>aeRENITY</Text>
    </Grid>
  );
}
