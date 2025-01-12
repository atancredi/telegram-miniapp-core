"use client";

import { InitData } from "@telegram-apps/init-data-node";

export const revalidate = 0;

interface HomePageProps {
    initData?: InitData
}

export const HomePage = ({ initData }: HomePageProps) => {

    return (
        <div className="w-screen h-screen">
            <div className="flex flex-col w-full">
                <div className="w-fit ml-auto mr-auto">Welcome {initData.user.firstName}!</div>
                <div className="w-fit ml-auto mr-auto">User ID {initData.user.id}</div>
            </div>
        </div>
    );

};
