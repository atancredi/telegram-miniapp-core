"use client";

import { useEffect, useState } from "react";
import { HomePage } from "./components/HomePage";
import { useTelegramMiniApp } from "./hooks/useTelegramMiniApp";
import { useQueryParams } from "./hooks/useQueryParams";
import { InitData } from "@telegram-apps/init-data-node";
// import { popup } from "@telegram-apps/sdk-react"; NOSONAR


export default function SupportBotApp() {

    const queryParams = useQueryParams();
    const miniApp = useTelegramMiniApp(queryParams);

    const [authorized, setAuthorized] = useState(false);
    const [initData, setInitData] = useState<InitData>();

    useEffect(() => {

        // Validate and send message
        if (miniApp.isTelegram) {

            miniApp.authorize()
                .then(data => {
                    // Redirect
                    console.log("User validated")
                    setInitData(data.data.initData)
                    setAuthorized(true);
                })
                .catch(error => {
                    console.error("An error occurred", error)
                    // popup.open({"message": "An error occurred"})
                })
        }
    }, [miniApp.isTelegram]);

    return authorized && (<HomePage initData={initData}></HomePage>)
}