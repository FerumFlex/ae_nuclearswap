import { createStyles, Header, Container, Group, Grid, Burger, Paper, Transition, Anchor, useMantineColorScheme, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from './Logo';
import { ThemeIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconSun, IconMoonStars } from '@tabler/icons';
import { AeWallet } from './AeWallet';
import { EthWallet } from './EthWallet';

const HEADER_HEIGHT = 80;

const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 1,
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  header: {
    height: '100%',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
  logo: {
    margin: "1rem"
  }
}));

interface HeaderResponsiveProps {
  links: { link: string; label: string}[];
}

export function HeaderResponsive({links }: HeaderResponsiveProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { classes } = useStyles();

  const items = links.map((link) => (
    <Grid.Col key={link.link} span={1}>
      <Anchor key={link.link} size="md" className={classes.link} component={Link} to={link.link}>{link.label}</Anchor>
    </Grid.Col>
  ));

  return (
    <Header height={HEADER_HEIGHT} style={{backgroundColor: "unset"}} className={classes.root}>
      <Grid justify="center" align="center" className={classes.header}>
        <Grid.Col span={1}>
          <ThemeIcon className={classes.logo}>
            <Logo />
          </ThemeIcon>
        </Grid.Col>
        <Grid.Col span={2}>
          &nbsp;
        </Grid.Col>
        <Grid.Col span={6}>
          <Grid justify="center" align="center" className={classes.links}>
            {items}
          </Grid>
        </Grid.Col>

        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>

        <Grid.Col span={3}>
          <Grid>
            <Grid.Col span={4}>
              <AeWallet />
            </Grid.Col>
            <Grid.Col span={4}>
              <EthWallet />
            </Grid.Col>
            <Grid.Col span={4}>
              <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Header>
  );
}