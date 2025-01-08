import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import {
    init,
    expandViewport,
    swipeBehavior,
    closingBehavior,
    mainButton, postEvent, setMiniAppHeaderColor
} from '@telegram-apps/sdk';
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import {
    on, defineEventHandlers, isTMA
} from '@telegram-apps/bridge';
import { HeaderColor } from "@telegram-apps/sdk/dist/dts/scopes/components/mini-app/types";
import { IQueryParams } from "./useQueryParams";


export interface IMiniApp {
    authorize: () => Promise<AxiosResponse<any, any>>
    isTelegram: boolean
}

export const useTelegramMiniApp = (queryParams: IQueryParams): IMiniApp => {

    const [isTelegram, setIsTelegram] = useState(false);

    const checkIsTelegram = async () => {
        if (await isTMA()) {
            console.log("is telegram")
            setIsTelegram(true);
        }
    }

    useEffect(() => {
        // Initialize Mini App
        checkIsTelegram()
    }, [])

    const expand = () => {
        // Expand miniapp
        let expandViewportAvailable = expandViewport.isAvailable();
        if (expandViewportAvailable) {
            expandViewport();
            console.log("Miniapp expanded")
        } else {
            console.warn("expandViewport available: ", expandViewportAvailable)
        }
    }

    const setHeaderColor = (color: HeaderColor) => { //NOSONAR
        let setMiniAppHeaderColorAvailable = setMiniAppHeaderColor.isAvailable(),
            setMiniAppHeaderColorSupportsRgb = setMiniAppHeaderColor.supports.rgb();
        if (setMiniAppHeaderColorAvailable && setMiniAppHeaderColorSupportsRgb) {
            setMiniAppHeaderColor(color)
            console.log("Header color changed to", color)
        } else {
            console.log('miniAppHeaderColor available: ', setMiniAppHeaderColorAvailable, 'supports rgb:', setMiniAppHeaderColorSupportsRgb)
        }
    }

    const setFullscreen = async () => {
        // listen for fullscreen changes
        on("fullscreen_changed", (isFullscreen) => {
            console.log("FULLSCREEN CHANGED", isFullscreen)
        })
        on("fullscreen_failed", (reason) => {
            console.log("FULLSCREEN FAILED", reason)
        })

        // listen for safeArea changes
        on('safe_area_changed', (safeAreaInset) => {
            console.log("SAFE AREA CHANGED", safeAreaInset)
        })
        on('content_safe_area_changed', (contentSafeAreaInset) => {
            console.log("CONTENT SAFE AREA CHANGED", contentSafeAreaInset)
        })

        // set full screen
        postEvent('web_app_request_fullscreen');

        // double safe area
        // postEvent('web_app_request_content_safe_area', {top: 60, bottom: 60})

    }

    const setDeviceOrientation = (mode: "portrait" | "landscape") => { //NOSONAR
        // listen for orientation changes
        // tg.WebApp.onEvent("deviceOrientationStarted", () => {
        //     console.log("deviceOrientation start", tg.WebApp.isOrientationLocked, tg.WebApp.DeviceOrientation)
        // })
        // tg.WebApp.onEvent("deviceOrientationStopped", () => {
        //     console.log("deviceOrientation stop", tg.WebApp.isOrientationLocked, tg.WebApp.DeviceOrientation)
        // })
        // tg.WebApp.onEvent("deviceOrientationChanged", () => {
        //     console.log("deviceOrientation CHANGED", tg.WebApp.isOrientationLocked, tg.WebApp.DeviceOrientation)
        // })
        // tg.WebApp.onEvent("deviceOrientationFailed", () => {
        //     console.log("deviceOrientation FAILED")
        // })
        // tg.WebApp.lockOrientation();
        // postEvent('web_app_request_fullscreen');
    }

    const setVerticalSwiping = () => {
        // Disable vertical swiping
        if (!swipeBehavior.isMounted()) {
            swipeBehavior.mount()
            console.log("Swipe behavior mounted")
            if (swipeBehavior.isVerticalEnabled()) {
                swipeBehavior.disableVertical()
                console.log("Vertical swipes disabled")
            }
        }
    }

    const setClosingConfirmation = () => {
        // Enable closing confirmation
        if (!closingBehavior.isMounted()) {
            closingBehavior.mount()
            console.log("Closing behavior mounted")
            if (!closingBehavior.isConfirmationEnabled()) {
                closingBehavior.enableConfirmation()
                console.log("Closing confirmation enabled")
            }
        }
    }

    const setMainButton = () => {
        // Disable Main Button
        if (!mainButton.isMounted()) {
            mainButton.mount()
            console.log("Mounted main button")
            if (mainButton.isEnabled() || mainButton.isVisible()) {
                mainButton.setParams({ isVisible: false })
                console.log("Main button disabled")
            }
        }
    }

    useEffect(() => {
        if (isTelegram) {
            try {
                init()
                defineEventHandlers();

                // setHeaderColor('#FFFF00')

                expand()

                if (queryParams.get("layout") == "fullscreen")
                    setFullscreen();

                // setDeviceOrientation("portrait"); //NOSONAR

                setVerticalSwiping();

                setClosingConfirmation();

                setMainButton();

                postEvent('web_app_ready')
                console.log("web app IS ready")

            } catch (error) {
                console.error(error)
            }
        }
    }, [isTelegram])

    const authorize = () => {
        const launchParams = retrieveLaunchParams();

        // Validate and send message
        if (launchParams.initDataRaw == undefined) throw Error("initDataRaw is undefined");

        return axios.post('/api/sendWebAppData', {}, {
            headers: {
                'Authorization': 'tma ' + launchParams.initDataRaw
            },
            // cache: 'no-store',
            // next: { revalidate: 0 }
        })

    };

    return {
        authorize,
        isTelegram
    }

}