import { sign, decode } from "jsonwebtoken";
import { Context } from "@twilio-labs/serverless-runtime-types/types";
import { MyContext } from "../types/twilio";
import { ConversationAttributes, AssistantMessageBody, JWTPayload } from "../types/utils";

async function sendMessageToAssistant(
    context: Context<MyContext>,
    assistantId: string,
    body: AssistantMessageBody
): Promise<void> {
    const environmentPrefix = context.TWILIO_REGION?.startsWith("stage")
        ? ".stage"
        : context.TWILIO_REGION?.startsWith("dev")
            ? ".dev"
            : "";
    const url = `https://assistants${environmentPrefix}.twilio.com/v1/Assistants/${assistantId}/Messages`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`,
                "utf-8"
            ).toString("base64")}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    if (response.ok) {
        console.log("Sent message to AI Assistant");
        return;
    } else {
        throw new Error(
            "Failed to send request to AI Assistants. " + (await response.text())
        );
    }
}

async function readConversationAttributes(
    context: Context<MyContext>,
    chatServiceSid: string,
    conversationSid: string
): Promise<ConversationAttributes> {
    try {
        const client = context.getTwilioClient();
        const data = await client.conversations.v1
            .services(chatServiceSid)
            .conversations(conversationSid)
            .fetch();
        return JSON.parse(data.attributes);
    } catch (err) {
        console.error(err);
        return {};
    }
}

async function getAssistantSid(context: Context<MyContext>, event: any): Promise<string> {
    if (event.EventType === "onMessageAdded") {
        try {
            const { ConversationSid, ChatServiceSid } = event;
            const parsed = await readConversationAttributes(
                context,
                ChatServiceSid,
                ConversationSid
            );
            if (typeof parsed.assistantSid === "string" && parsed.assistantSid) {
                return parsed.assistantSid;
            }
        } catch (err) {
            console.log("Invalid attribute structure", err);
        }
    }

    // Support both lowercase (URL parameters) and capital A (Twilio webhooks)
    const assistantSid = event.assistantSid || event.AssistantSid;

    if (!assistantSid) {
        throw new Error("Missing assistantSid in event");
    }

    return assistantSid;
}

async function signRequest(context: Context<MyContext>, event: any): Promise<string> {
    const assistantSid = await getAssistantSid(context, event);
    const authToken = context.AUTH_TOKEN;
    if (!authToken) {
        throw new Error("No auth token found");
    }
    return sign({ assistantSid }, authToken, { expiresIn: "5m" });
}

function verifyRequest(context: Context<MyContext>, event: any): boolean {
    const token = event._token;
    if (!token) {
        throw new Error("Missing token");
    }

    const authToken = context.AUTH_TOKEN;
    if (!authToken) {
        throw new Error("No auth token found");
    }

    try {
        const decoded = decode(token, { json: true }) as JWTPayload | null;
        if (decoded?.assistantSid) {
            return true;
        }
    } catch (err) {
        console.error("Failed to verify token", err);
        return false;
    }
    return false;
}

export {
    getAssistantSid,
    signRequest,
    verifyRequest,
    sendMessageToAssistant,
    readConversationAttributes,
};
