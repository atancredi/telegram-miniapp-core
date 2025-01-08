import { NextResponse, NextRequest } from 'next/server'
import { validate, parse, InitData } from '@telegram-apps/init-data-node';
import axios from 'axios';

type ResponseData = {
    message: string,
    initData?: InitData
}

const sendMessage = (openedMessage: string, initData: InitData, secret_bot_token: string) => {
    return new Promise((resolve, reject) => {
        const userId = initData.user.id;
        const queryId = initData.queryId;
        console.log("sendMessage |", userId, "|", queryId);

        axios.post(`https://api.telegram.org/bot${secret_bot_token}/sendMessage`, {
            chat_id: userId,
            text: openedMessage // debug only, cambiare con messaggio preso da config anche
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async (response) => {
            console.log("SendMessage |", response.status);
            if (response.status !== 200) {
                console.error("SendMessage ERROR | ", response.data);
                reject(Error(`sendMessage: ${response.status}`));
            }
            const responseData = response.data;
            if (responseData.ok) {
                resolve(responseData.result);
            } else {
                reject(Error("message wasn't properly sent"));
            }
        }).catch((error: Error) => {
            console.error("SendMessage ERROR |", error.message)
            reject(error);
        });
    });
};

const getBotSecretList = (() => {
    // Check if botSecretToken is present
    if (!process.env.BOT_TOKEN_LIST) {
        console.error("ERROR | Bot token list not found")
        throw Error("Bot token list not found");
    }

    return process.env.BOT_TOKEN_LIST.split(",")
})

const validateTokens = (botTokens: string[], authData: string): string | null => {
    let validToken: string | null = null;
    for (const botToken of botTokens) {
        try {
            // Validate init data.
            validate(authData, botToken, {
                // We consider init data sign valid for 1 hour from their creation moment.
                expiresIn: 3600,
            });
            validToken = botToken;
            break;
        } catch (error) {
            if (error.message === "Sign is invalid") continue;
            else throw Error(error);
        }

    }
    return validToken
}

export async function POST(
    req: NextRequest
): Promise<NextResponse<ResponseData>> {

    console.log("sendWebAppData START")
    const [authType, authData = ''] = (req.headers.get('authorization') || '').split(' ');
    try {

        if (authType == "tma") {
            let parsedInitData: InitData;

            const tokens = getBotSecretList();

            // get a valid token
            let validToken = validateTokens(tokens, authData);
            if (validToken != null) {
                // parse initData
                parsedInitData = parse(authData);
                console.log("sendWebAppData VALIDATED |", parsedInitData.user.id)

                return NextResponse.json({ message: "ok", initData: parsedInitData }, { status: 200 });
            }

        }

        console.warn("sendWebAppData INVALID");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    } catch (error) {
        console.error("sendWebAppData ERROR |", error.message);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

