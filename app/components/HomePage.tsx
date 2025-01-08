"use client";

import { InitData } from "@telegram-apps/init-data-node";

export const revalidate = 0;

interface HomePageProps {
    initData?: InitData
}

export const HomePage = ({initData}: HomePageProps) => {

    return (
        <>
            Welcome {initData.user.firstName}!<br />
            User ID {initData.user.id}
        </>
    );

};
