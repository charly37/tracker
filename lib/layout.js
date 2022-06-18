import React, { useState } from 'react';
import { createStyles, Header, Container, Group } from '@mantine/core';

function Layout({ children }) {

    const useStyles = createStyles((theme) => ({
        headerst: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
        },

        links: {
            [theme.fn.smallerThan('xs')]: {
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
        },
    }));

    const links = [
        {
            "link": "/portfolios",
            "label": "Portfolios"
        },
        {
            "link": "/assets",
            "label": "Assets"
        },
        {
            "link": "/providers",
            "label": "Providers"
        },
        {
            "link": "/stats",
            "label": "Stats"
        },
        
        {
            "link": "/about",
            "label": "About"
        }
    ]

    const { classes } = useStyles();



    const items = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
        >
            {link.label}
        </a>
    ));

    const Header2 = () => {
        return (
            <Header height={40} mb={20}>
                <Container className={classes.headerst}>
                    <Group spacing={5} className={classes.links}>
                        {items}
                    </Group>


                </Container>
            </Header>
        )
    };

    const Footer = () => {
        return <h3>This is Footer</h3>;
    };

    return (
        <>
            <Header2 />
            {children}
            
        </>
    );


}

export default Layout;